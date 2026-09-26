import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DataCleaner } from "@/components/dashboard/DataCleaner";
import {
  Upload,
  Download,
  LogOut,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const { data: files, refetch } = useQuery({
    queryKey: ["processed-files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processed_files")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
        toast.error("Please upload a CSV or Excel file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB.");
        return;
      }

      setUploading(true);
      try {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from("processed_files").insert({
          user_id: user.id,
          original_filename: file.name,
          original_file_url: filePath,
          status: "pending",
        });
        if (insertError) throw insertError;

        toast.success("File uploaded! Processing will begin shortly.");
        refetch();
      } catch (err: any) {
        toast.error(err.message || "Upload failed");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [user, refetch]
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 size={16} className="text-accent" />;
      case "processing":
        return <Loader2 size={16} className="text-primary animate-spin" />;
      case "error":
        return <AlertCircle size={16} className="text-destructive" />;
      default:
        return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container-tight flex items-center justify-between h-16 px-4 md:px-8">
          <div className="flex items-center gap-2 text-lg font-bold text-foreground">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">E</span>
            </div>
            ExcelFlow AI
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut size={16} className="mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container-tight px-4 md:px-8 py-8">
        <DataCleaner onDone={() => refetch()} />

        {/* File history */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Processed Files</h3>
          {!files || files.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <FileSpreadsheet className="text-muted-foreground mx-auto mb-3" size={32} />
              <p className="text-muted-foreground text-sm">No files yet. Upload your first file to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="glass-card rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {statusIcon(file.status)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()} ·{" "}
                        <span className="capitalize">{file.status}</span>
                        {file.status === "done" && file.rows_processed
                          ? ` · ${file.rows_processed} rows`
                          : ""}
                      </p>
                    </div>
                  </div>
                  {file.status === "done" && file.cleaned_file_url && (
                    <Button variant="outline" size="sm">
                      <Download size={14} className="mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
