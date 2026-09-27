import { createClient } from "npm:@supabase/supabase-js@2";
import { createResponsesCall } from "../_shared/responses.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const MAX_ROWS = 300;

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

    const { columns, rows, instructions, fileId } = await req.json();
    if (!Array.isArray(columns) || !Array.isArray(rows) || rows.length === 0)
      return json({ error: "The file has no data rows." }, 400);
    if (rows.length > MAX_ROWS) return json({ error: `Please upload up to ${MAX_ROWS} rows.` }, 400);

    const system = `You clean messy spreadsheet data for small businesses. Remove exact and near-duplicate rows, standardize dates to YYYY-MM-DD, numbers/currency to plain numbers, phone numbers to consistent format, trim whitespace, fix casing of names/cities, and fix obvious typos. Follow the user's extra instructions (they may add, split or rename columns). Respond ONLY with a JSON object, no markdown:
{"columns": string[], "rows": string[][], "changes": [{"row": number, "column": string, "before": string, "after": string, "reason": string}], "duplicates_removed": number, "formats_fixed": number, "summary": string}
"row" is the 1-based original row number. List at most 40 changes. summary is one short plain-English sentence.`;
    const user_msg = `Instructions: ${instructions?.trim() || "(none, do a standard cleanup)"}\n\nColumns: ${JSON.stringify(columns)}\nRows:\n${JSON.stringify(rows)}`;

    const { result } = createResponsesCall(
      req,
      { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra", effort: "high" },
      [{ role: "user", content: system + "\n\n" + user_msg }],
    );
    let text = "";
    try {
      for await (const part of result.fullStream) {
        if (part.type === "text-delta") text += (part as any).text ?? (part as any).delta ?? "";
        if (part.type === "error") throw (part as any).error;
      }
    } catch (e: any) {
      console.error("AI error", e?.statusCode, e?.message, e?.responseBody);
      const status = e?.statusCode ?? e?.lastError?.statusCode;
      if (status === 402) return json({ error: "AI credits are used up. Please add credits to continue." }, 402);
      if (status === 429) return json({ error: "Too many requests right now. Please try again in a minute." }, 429);
      if (status === 403) return json({ error: e?.message ?? "AI access was denied." }, 403);
      throw e;
    }
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return json({ error: "The AI could not clean this file. Please try again." }, 502);
    const out = JSON.parse(match[0]);

    if (fileId) {
      const esc = (v: unknown) => {
        const s = String(v ?? "");
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv = [out.columns, ...(out.rows ?? [])].map((r: unknown[]) => r.map(esc).join(",")).join("\n");
      const cleanPath = `${user.id}/cleaned/${fileId}.csv`;
      const { error: upErr } = await supabase.storage.from("uploads")
        .upload(cleanPath, new Blob([csv], { type: "text/csv" }), { upsert: true, contentType: "text/csv" });
      if (upErr) console.error("save clean file", upErr);
      await supabase.from("processed_files").update({
        status: "done",
        cleaned_file_url: upErr ? null : cleanPath,
        rows_processed: out.rows?.length ?? 0,
        duplicates_removed: out.duplicates_removed ?? 0,
        formats_fixed: out.formats_fixed ?? 0,
      }).eq("id", fileId);
    }
    return json(out);
  } catch (e: any) {
    console.error(e);
    return json({ error: e?.message ?? "Something went wrong." }, 500);
  }
});
