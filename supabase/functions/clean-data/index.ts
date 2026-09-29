import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const MAX_ROWS = 300;

const RULES = `You are a careful data-cleaning engine for small businesses. DATA PRESERVATION MATTERS MORE THAN MAKING DATA LOOK PERFECT. When uncertain, FLAG — DO NOT GUESS.

Rules:
1. Detect header, columns and data types. Never assume a column of digits is numeric.
2. Trim leading/trailing whitespace. Keep meaningful inner spaces.
3. Normalize obvious casing inconsistencies ("pune","PUNE"," Pune " -> "Pune"). If meaning is uncertain, leave it.
4. Duplicates: remove only EXACT duplicate rows (identical after trimming/casing). Rows that only share an email/phone/ID or have similar names are POSSIBLE duplicates: keep them and list them in possible_duplicates. Never merge records.
5. IDs, phone numbers, account numbers, ZIP/PIN, invoice numbers stay TEXT exactly as digits. Never use scientific notation. Never add/remove country codes unless explicitly requested.
6. Dates: convert only clearly valid, unambiguous dates to YYYY-MM-DD (15/01/2026 -> 2026-01-15, Jan 15, 2026 -> 2026-01-15). Ambiguous (e.g. 03/04/2026 with no other evidence in the column) or invalid (2026-13-45, "yesterday"): keep the original value and flag INVALID_DATE or AMBIGUOUS_DATE.
7. Numbers/currency: convert clearly formatted values (₹12,500 -> 12500). Ambiguous values like "9.500": keep original, flag AMBIGUOUS_NUMBER.
8. Missing values (empty, NULL, N/A, NA, None, Unknown, Missing, -): set to "" and count them. Never fabricate replacements.
9. Suspicious values (Age -5 or 999, Phone "abc", Revenue "abc", Status "???"): keep original, flag INVALID_VALUE.
10. Emails: trim and lowercase obvious ones. Missing @ or domain (e.g. "amit@gmail", "test@"): keep original, flag INVALID_EMAIL. Never invent a domain.
11. NEVER fill a cell with a value from another row.
12. Row integrity: every output row must keep its values together in the same columns. Never shift values between rows or columns. Keep output rows in original order.
13. Confidence: only APPLY HIGH-confidence changes. MEDIUM/LOW-confidence ideas must NOT be applied — list them in issues with a suggestion.
14. Follow the user's extra instructions (they may split/rename/add columns) but these rules still apply.
15. Before answering, re-check your output: no corrupted phones, no scientific notation, no lost values, no cross-row copying, aligned columns, no duplicate IDs introduced. Revert any change that broke something and report it in validation.

Respond ONLY with a JSON object, no markdown:
{"columns": string[],
 "rows": string[][],
 "summary": {"duplicates_removed": number, "values_normalized": number, "missing_values": number, "invalid_values": number, "ambiguous_values": number, "rows_requiring_review": number, "type_changes": [{"column": string, "from": string, "to": string}]},
 "issues": [{"row": number, "column": string, "value": string, "flag": "INVALID_DATE"|"AMBIGUOUS_DATE"|"AMBIGUOUS_NUMBER"|"INVALID_EMAIL"|"INVALID_VALUE"|"MISSING"|"NEEDS_REVIEW", "note": string, "suggestion": string}],
 "possible_duplicates": [{"rows": number[], "reason": string}],
 "changes": [{"row": number, "column": string, "before": string, "after": string, "reason": string, "confidence": "HIGH"}],
 "validation": [{"check": string, "status": "pass"|"reverted"|"warning", "note": string}],
 "summary_text": string}
All "row" numbers are 1-based ORIGINAL data row numbers (header excluded). List at most 80 changes and 80 issues. summary_text is one short plain-English sentence.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Please sign in again." }, 401);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const { data: prof } = await supabase.from("profiles").select("credits").eq("user_id", user.id).maybeSingle();
    if (!prof || prof.credits < 1) return json({ error: "You're out of credits. Please buy more to keep cleaning." }, 402);

    const { columns, rows, instructions, fileId } = await req.json();
    if (!Array.isArray(columns) || !Array.isArray(rows) || rows.length === 0)
      return json({ error: "The file has no data rows." }, 400);
    if (rows.length > MAX_ROWS) return json({ error: `Please upload up to ${MAX_ROWS} rows.` }, 400);

    // Mark this user's stale "processing" files (older than 10 min) as failed
    await supabase.from("processed_files").update({ status: "error", error_message: "Timed out. Please try again." })
      .eq("user_id", user.id).eq("status", "processing").lt("created_at", new Date(Date.now() - 10 * 60_000).toISOString());

    const extra = String(instructions ?? "").trim() || "(none, do a standard safe cleanup)";
    const CHUNK = 40;
    const chunks: { start: number; rows: unknown[] }[] = [];
    for (let i = 0; i < rows.length; i += CHUNK) chunks.push({ start: i, rows: rows.slice(i, i + CHUNK) });

    const cleanChunk = async (c: { start: number; rows: unknown[] }) => {
      const msg = `Instructions: ${extra}\n\nThis is part of a larger file. Do NOT remove duplicate rows yourself (return every row; the server removes exact duplicates). Row numbers here start at ${c.start + 1}.\n\nColumns: ${JSON.stringify(columns)}\nRows (first row = row ${c.start + 1}):\n${JSON.stringify(c.rows)}`;
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          reasoning: { effort: "low" },
          store: false,
          input: [{ role: "user", content: RULES + "\n\n" + msg }],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw Object.assign(new Error(body.slice(0, 300) || `AI error ${res.status}`), { statusCode: res.status });
      }
      const data = await res.json();
      const text: string = data.output_text ??
        (data.output ?? []).flatMap((o: any) => o.content ?? []).filter((c: any) => c.type === "output_text").map((c: any) => c.text).join("");
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("The AI could not clean this file. Please try again.");
      return JSON.parse(m[0]);
    };

    let parts: any[];
    try {
      parts = await Promise.all(chunks.map(cleanChunk));
    } catch (e: any) {
      console.error("AI error", e?.statusCode, e?.message, e?.responseBody);
      const status = e?.statusCode ?? e?.lastError?.statusCode;
      if (status === 402) return json({ error: "AI credits are used up. Please add credits to continue." }, 402);
      if (status === 429) return json({ error: "Too many requests right now. Please try again in a minute." }, 429);
      if (status === 403) return json({ error: e?.message ?? "AI access was denied." }, 403);
      return json({ error: e?.message ?? "The AI could not clean this file. Please try again." }, 502);
    }

    const cat = (k: string) => parts.flatMap((p) => (Array.isArray(p?.[k]) ? p[k] : []));
    const sumOf = (k: string) => parts.reduce((a, p) => a + (Number(p?.summary?.[k]) || 0), 0);
    const outCols: string[] = Array.isArray(parts[0]?.columns) ? parts[0].columns.map(String) : columns.map(String);
    const typeChanges = new Map<string, any>();
    parts.forEach((p) => (p?.summary?.type_changes ?? []).forEach((t: any) => typeChanges.set(t?.column, t)));
    const out = {
      rows: cat("rows"),
      summary: {
        duplicates_removed: 0,
        values_normalized: sumOf("values_normalized"),
        missing_values: sumOf("missing_values"),
        invalid_values: sumOf("invalid_values"),
        ambiguous_values: sumOf("ambiguous_values"),
        rows_requiring_review: sumOf("rows_requiring_review"),
        type_changes: [...typeChanges.values()],
      },
      issues: [
        ...cat("issues"),
        // Only HIGH-confidence changes count as automatic; anything else goes to review
        ...cat("changes").filter((c: any) => String(c?.confidence ?? "HIGH").toUpperCase() !== "HIGH").map((c: any) => ({
          row: c.row, column: c.column, value: c.before, flag: `${String(c.confidence).toUpperCase()} confidence`,
          note: c.reason, suggestion: c.after,
        })),
      ].slice(0, 200),
      possible_duplicates: cat("possible_duplicates"),
      changes: cat("changes").filter((c: any) => String(c?.confidence ?? "HIGH").toUpperCase() === "HIGH").slice(0, 200),
      summary_text: "",
    } as any;

    // Server-side safety pass
    const validation: any[] = cat("validation");

    let misaligned = 0;
    const seen = new Set<string>();
    let dupes = 0;
    const outRows: string[][] = (Array.isArray(out.rows) ? out.rows : []).map((r: unknown[]) => {
      const row = (Array.isArray(r) ? r : []).map((v) => (v == null ? "" : String(v)));
      if (row.length !== outCols.length) misaligned++;
      while (row.length < outCols.length) row.push("");
      return row.slice(0, outCols.length);
    }).filter((row: string[]) => {
      const key = JSON.stringify(row.map((v) => v.trim().toLowerCase()));
      if (seen.has(key)) { dupes++; return false; }
      seen.add(key);
      return true;
    });
    out.summary.duplicates_removed = dupes;
    out.summary_text = `Cleaned ${outRows.length} rows: ${dupes} exact duplicates removed, ${out.summary.values_normalized} values fixed, ${out.summary.rows_requiring_review} rows to review.`;
    validation.push({
      check: "Column alignment",
      status: misaligned ? "warning" : "pass",
      note: misaligned ? `${misaligned} rows had a different number of cells and were padded/trimmed — please review.` : "Every row has the right number of columns.",
    });
    const sci = outRows.flat().filter((v) => /^\d(\.\d+)?e\+\d+$/i.test(v)).length;
    validation.push({
      check: "No scientific notation",
      status: sci ? "warning" : "pass",
      note: sci ? `${sci} values look like scientific notation — check ID/phone columns.` : "IDs and phone numbers kept as full digits.",
    });
    if (outRows.length === 0) return json({ error: "Cleaning returned no rows, so nothing was changed. Please try again." }, 502);

    const s = out.summary ?? {};
    const summary = {
      rows_before: rows.length,
      rows_after: outRows.length,
      columns: outCols.length,
      duplicates_removed: Number(s.duplicates_removed) || 0,
      values_normalized: Number(s.values_normalized) || 0,
      missing_values: Number(s.missing_values) || 0,
      invalid_values: Number(s.invalid_values) || 0,
      ambiguous_values: Number(s.ambiguous_values) || 0,
      rows_requiring_review: Number(s.rows_requiring_review) || 0,
      type_changes: Array.isArray(s.type_changes) ? s.type_changes : [],
    };
    const payload = {
      columns: outCols,
      rows: outRows,
      summary,
      issues: Array.isArray(out.issues) ? out.issues : [],
      possible_duplicates: Array.isArray(out.possible_duplicates) ? out.possible_duplicates : [],
      changes: Array.isArray(out.changes) ? out.changes : [],
      validation,
      summary_text: String(out.summary_text ?? "Your data has been cleaned."),
    };

    if (fileId) {
      const esc = (v: unknown) => {
        const s = String(v ?? "");
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv = [outCols, ...outRows].map((r) => r.map(esc).join(",")).join("\n");
      const cleanPath = `${user.id}/cleaned/${fileId}.csv`;
      const { error: upErr } = await supabase.storage.from("uploads")
        .upload(cleanPath, new Blob([csv], { type: "text/csv" }), { upsert: true, contentType: "text/csv" });
      if (upErr) console.error("save clean file", upErr);
      await supabase.from("processed_files").update({
        status: "done",
        cleaned_file_url: upErr ? null : cleanPath,
        rows_processed: outRows.length,
        duplicates_removed: summary.duplicates_removed,
        formats_fixed: summary.values_normalized,
      }).eq("id", fileId);
    }
    const { data: left } = await supabase.rpc("use_credit");
    return json({ ...payload, credits_left: left });
  } catch (e: any) {
    console.error(e);
    return json({ error: e?.message ?? "Something went wrong." }, 500);
  }
});
