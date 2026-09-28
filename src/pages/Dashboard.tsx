import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditsCard } from "@/components/dashboard/CreditsCard";
import { BuyCreditsDialog } from "@/components/dashboard/BuyCreditsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
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
  MoreVertical,
  Coins,
} from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [buyOpen, setBuyOpen] = useState(false);

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

  const { data: credits, refetch: refetchCredits } = useQuery({
    queryKey: ["credits", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("credits").eq("user_id", user!.id).maybeSingle();
      return data?.credits ?? 0;
    },
  });

  const downloadFile = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("uploads").download(path);
    if (error || !data) return toast.error("Could not download this file.");
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.replace(/\.(csv|xlsx?)$/i, "") + "_clean.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">Website</Link>
            <span className="text-sm text-muted-foreground hidden md:block truncate max-w-[200px]">
              {user?.email}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More options">
                  <MoreVertical size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => setBuyOpen(true)}>
                  <Coins size={16} className="mr-2" />
                  Buy credits
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/">Website</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden sm:flex">
              <LogOut size={16} className="mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container-tight px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Your files and results, all in one place.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            ["Files cleaned", files?.filter((f) => f.status === "done").length ?? 0],
            ["Rows cleaned", files?.reduce((s, f) => s + (f.rows_processed ?? 0), 0) ?? 0],
            ["Duplicates removed", files?.reduce((s, f) => s + (f.duplicates_removed ?? 0), 0) ?? 0],
            ["Values fixed", files?.reduce((s, f) => s + (f.formats_fixed ?? 0), 0) ?? 0],
          ].map(([label, value]) => (
            <div key={label as string} className="glass-card rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">{Number(value).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <CreditsCard credits={credits} onBuyCredits={() => setBuyOpen(true)} />

        <BuyCreditsDialog open={buyOpen} onOpenChange={setBuyOpen} />

        <DataCleaner onDone={() => { refetch(); refetchCredits(); }} />

        {/* File history */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Your file history</h3>
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
                        {new Date(file.created_at).toLocaleString()} ·{" "}
                        <span className="capitalize">{file.status}</span>
                        {file.status === "done" && file.rows_processed
                          ? ` · ${file.rows_processed} rows · ${file.duplicates_removed ?? 0} duplicates removed · ${file.formats_fixed ?? 0} fixed`
                          : ""}
                        {file.status === "error" && file.error_message ? ` · ${file.error_message}` : ""}
                      </p>
                    </div>
                  </div>
                  {file.status === "done" && file.cleaned_file_url && (
                    <Button variant="outline" size="sm" onClick={() => downloadFile(file.cleaned_file_url!, file.original_filename)}>
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
