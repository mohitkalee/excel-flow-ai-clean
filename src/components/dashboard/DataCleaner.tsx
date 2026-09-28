import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, Sparkles, Upload } from "lucide-react";

type Change = { row: number; column: string; before: string; after: string; reason: string; confidence?: string };
type Issue = { row: number; column: string; value: string; flag: string; note: string; suggestion?: string };
type Dup = { rows: number[]; reason: string };
type Check = { check: string; status: string; note: string };
type Summary = {
  rows_before: number; rows_after: number; columns: number; duplicates_removed: number;
  values_normalized: number; missing_values: number; invalid_values: number; ambiguous_values: number;
  rows_requiring_review: number; type_changes: { column: string; from: string; to: string }[];
};
type Result = {
  columns: string[]; rows: string[][]; summary: Summary; issues: Issue[];
  possible_duplicates: Dup[]; changes: Change[]; validation: Check[]; summary_text: string;
};

const MAX_ROWS = 300;

const toCsv = (aoa: unknown[][]) => XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(aoa));
const save = (text: string, name: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

export const DataCleaner = ({ onDone }: { onDone: () => void }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const pick = (f?: File) => {
    if (!f) return;
    if (!f.name.match(/\.(csv|xls|xlsx)$/i)) return toast.error("Please upload a CSV or Excel file.");
    if (f.size > 10 * 1024 * 1024) return toast.error("File size must be under 10MB.");
    setFile(f);
    setResult(null);
  };

  const run = async () => {
    if (!file || !user) return;
    setBusy(true);
    setResult(null);
    let fileId: string | undefined;
    try {
      // Read everything as text so IDs/phones never become numbers or scientific notation
      const isCsv = /\.csv$/i.test(file.name);
      const wb = isCsv
        ? XLSX.read(await file.text(), { type: "string", raw: true, cellDates: false })
        : XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: "" });
      const [columns, ...rows] = data.filter((r) => r.some((c) => String(c).trim() !== ""));
      if (!columns || rows.length === 0) throw new Error("The file has no data rows.");
      if (rows.length > MAX_ROWS) throw new Error(`Please upload a file with up to ${MAX_ROWS} rows.`);
      if (wb.SheetNames.length > 1) toast.info(`Only the first sheet ("${wb.SheetNames[0]}") will be cleaned.`);

      const path = `${user.id}/${Date.now()}_${file.name}`;
      await supabase.storage.from("uploads").upload(path, file);
      const { data: row } = await supabase.from("processed_files").insert({
        user_id: user.id, original_filename: file.name, original_file_url: path, status: "processing",
      }).select("id").single();
      fileId = row?.id;
      onDone();

      const { data: out, error } = await supabase.functions.invoke("clean-data", {
        body: { columns: columns.map(String), rows: rows.map((r) => r.map(String)), instructions, fileId },
      });
      if (error) {
        let msg = error.message;
        try { msg = (await (error as any).context.json()).error ?? msg; } catch { /* keep */ }
        throw new Error(msg);
      }
      if (out?.error) throw new Error(out.error);
      setResult(out);
      toast.success("Your data is clean!");
    } catch (e: any) {
      toast.error(e.message || "Cleaning failed");
      if (fileId) await supabase.from("processed_files").update({ status: "error", error_message: e.message }).eq("id", fileId);
    } finally {
      setBusy(false);
      onDone();
    }
  };

  const base = file?.name.replace(/\.(csv|xlsx?)$/i, "") ?? "file";
  const download = () => result && save(toCsv([result.columns, ...result.rows]), `${base}_clean.csv`);
  const downloadReport = () => {
    if (!result) return;
    const s = result.summary;
    const aoa: unknown[][] = [
      ["CLEANING SUMMARY"],
      ["Rows before", s.rows_before], ["Rows after", s.rows_after], ["Columns", s.columns],
      ["Exact duplicates removed", s.duplicates_removed], ["Values normalized", s.values_normalized],
      ["Missing values", s.missing_values], ["Invalid values", s.invalid_values],
      ["Ambiguous values", s.ambiguous_values], ["Rows requiring review", s.rows_requiring_review],
      [], ["COLUMN TYPE CHANGES"], ["Column", "From", "To"],
      ...s.type_changes.map((t) => [t.column, t.from, t.to]),
      [], ["ISSUES REQUIRING REVIEW"], ["Row", "Column", "Value", "Flag", "Note", "Suggestion"],
      ...result.issues.map((i) => [i.row, i.column, i.value, i.flag, i.note, i.suggestion ?? ""]),
      [], ["POSSIBLE DUPLICATES (kept)"], ["Rows", "Reason"],
      ...result.possible_duplicates.map((d) => [d.rows.join(" & "), d.reason]),
      [], ["CHANGE LOG"], ["Row", "Column", "Original", "New", "Reason", "Confidence"],
      ...result.changes.map((c) => [c.row, c.column, c.before, c.after, c.reason, c.confidence ?? "HIGH"]),
      [], ["VALIDATION REPORT"], ["Check", "Status", "Note"],
      ...result.validation.map((v) => [v.check, v.status, v.note]),
    ];
    save(toCsv(aoa), `${base}_cleaning_report.csv`);
  };

  const s = result?.summary;
  const stats = s ? [
    ["Rows before", s.rows_before], ["Rows after", s.rows_after], ["Duplicates removed", s.duplicates_removed],
    ["Values fixed", s.values_normalized], ["Missing", s.missing_values], ["Invalid", s.invalid_values],
    ["Ambiguous", s.ambiguous_values], ["Rows to review", s.rows_requiring_review],
  ] as const : [];

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
        className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
      >
        <input type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          {file ? <FileSpreadsheet className="text-primary" /> : <Upload className="text-primary" />}
        </div>
        <p className="font-semibold text-foreground">{file ? file.name : "Drop your CSV or Excel file here"}</p>
        <p className="text-sm text-muted-foreground">{file ? "Click to choose another file" : `or click to browse · up to ${MAX_ROWS} rows, 10MB`}</p>
      </label>

      <div className="mt-5">
        <label className="text-sm font-medium text-foreground">What should we fix? (optional)</label>
        <Textarea
          className="mt-2"
          placeholder='e.g. "Split full names into first and last", "Clean phone numbers", "Dates as DD/MM/YYYY"'
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-2">We only fix what we're sure about. Anything unclear is kept as-is and flagged for you.</p>
      </div>

      <Button className="mt-5 rounded-full" onClick={run} disabled={!file || busy}>
        {busy ? <><Loader2 size={16} className="mr-2 animate-spin" />Cleaning your data…</> : <><Sparkles size={16} className="mr-2" />Clean my data</>}
      </Button>

      {result && s && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-semibold text-foreground">{result.summary_text}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={download} className="rounded-full"><Download size={16} className="mr-2" />Download clean file</Button>
              <Button onClick={downloadReport} variant="outline" className="rounded-full"><Download size={16} className="mr-2" />Download report</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(([label, v]) => (
              <div key={label} className="rounded-xl border border-border p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold text-foreground">{v}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="preview">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="review">Needs review ({result.issues.length + result.possible_duplicates.length})</TabsTrigger>
              <TabsTrigger value="changes">Change log ({result.changes.length})</TabsTrigger>
              <TabsTrigger value="checks">Safety checks</TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              <div className="overflow-auto max-h-96 rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>{result.columns.map((c, i) => <th key={i} className="text-left px-3 py-2 font-medium text-foreground">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {result.rows.slice(0, 100).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {r.map((c, j) => <td key={j} className="px-3 py-2 text-foreground whitespace-nowrap">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-2">
              {result.issues.length + result.possible_duplicates.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing needs your review.</p>
              )}
              {result.possible_duplicates.map((d, i) => (
                <div key={`d${i}`} className="text-sm rounded-lg border border-border p-3">
                  <span className="font-medium text-foreground">Possible duplicate · rows {d.rows.join(" & ")}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{d.reason} — both rows were kept.</span>
                </div>
              ))}
              {result.issues.map((it, i) => (
                <div key={i} className="text-sm rounded-lg border border-border p-3">
                  <span className="text-muted-foreground">Row {it.row} · {it.column}: </span>
                  <span className="font-medium text-foreground">{it.value || "(empty)"}</span>
                  <span className="ml-2 text-xs rounded-full bg-destructive/10 text-destructive px-2 py-0.5">{it.flag}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{it.note}{it.suggestion ? ` · Suggestion: ${it.suggestion}` : ""}</span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="changes" className="space-y-2">
              {result.changes.length === 0 && <p className="text-sm text-muted-foreground">No automatic changes were needed.</p>}
              {result.changes.map((c, i) => (
                <div key={i} className="text-sm rounded-lg border border-border p-3">
                  <span className="text-muted-foreground">Row {c.row} · {c.column}: </span>
                  <span className="line-through text-destructive">{c.before || "(empty)"}</span>
                  <span className="mx-2">→</span>
                  <span className="text-accent font-medium">{c.after || "(empty)"}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{c.confidence ?? "HIGH"}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{c.reason}</span>
                </div>
              ))}
              {s.type_changes.length > 0 && (
                <p className="text-xs text-muted-foreground pt-2">
                  Column types changed: {s.type_changes.map((t) => `${t.column} (${t.from} → ${t.to})`).join(", ")}
                </p>
              )}
            </TabsContent>

            <TabsContent value="checks" className="space-y-2">
              {result.validation.map((v, i) => (
                <div key={i} className="flex gap-3 text-sm rounded-lg border border-border p-3">
                  {v.status === "pass"
                    ? <CheckCircle2 size={18} className="text-accent shrink-0" />
                    : <AlertTriangle size={18} className="text-destructive shrink-0" />}
                  <div>
                    <p className="font-medium text-foreground">{v.check}</p>
                    <p className="text-xs text-muted-foreground">{v.note}</p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
