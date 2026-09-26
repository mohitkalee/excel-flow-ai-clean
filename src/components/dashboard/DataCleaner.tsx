import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Loader2, Sparkles, Upload } from "lucide-react";

type Change = { row: number; column: string; before: string; after: string; reason: string };
type Result = {
  columns: string[];
  rows: string[][];
  changes: Change[];
  duplicates_removed: number;
  formats_fixed: number;
  summary: string;
};

const MAX_ROWS = 300;

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
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const data = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[wb.SheetNames[0]], {
        header: 1, raw: false, defval: "",
      });
      const [columns, ...rows] = data.filter((r) => r.some((c) => String(c).trim() !== ""));
      if (!columns || rows.length === 0) throw new Error("The file has no data rows.");
      if (rows.length > MAX_ROWS) throw new Error(`Please upload a file with up to ${MAX_ROWS} rows.`);

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

  const download = () => {
    if (!result || !file) return;
    const ws = XLSX.utils.aoa_to_sheet([result.columns, ...result.rows]);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.(csv|xlsx?)$/i, "") + "_clean.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
      </div>

      <Button className="mt-5 rounded-full" onClick={run} disabled={!file || busy}>
        {busy ? <><Loader2 size={16} className="mr-2 animate-spin" />Cleaning your data…</> : <><Sparkles size={16} className="mr-2" />Clean my data</>}
      </Button>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">{result.summary}</p>
              <p className="text-sm text-muted-foreground">
                {result.rows.length} rows · {result.duplicates_removed} duplicates removed · {result.formats_fixed} values fixed
              </p>
            </div>
            <Button onClick={download} className="rounded-full"><Download size={16} className="mr-2" />Download clean file</Button>
          </div>

          <div className="overflow-auto max-h-96 rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>{result.columns.map((c) => <th key={c} className="text-left px-3 py-2 font-medium text-foreground">{c}</th>)}</tr>
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

          {result.changes?.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-3">What we fixed</h4>
              <div className="space-y-2">
                {result.changes.map((c, i) => (
                  <div key={i} className="text-sm rounded-lg border border-border p-3">
                    <span className="text-muted-foreground">Row {c.row} · {c.column}: </span>
                    <span className="line-through text-destructive">{c.before || "(empty)"}</span>
                    <span className="mx-2">→</span>
                    <span className="text-accent font-medium">{c.after || "(empty)"}</span>
                    <span className="block text-xs text-muted-foreground mt-1">{c.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
