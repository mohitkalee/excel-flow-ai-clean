import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Check } from "lucide-react";

const packs = [
  { credits: 50, price: 99, best: false },
  { credits: 100, price: 149, best: true },
];

export const BuyCreditsDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md rounded-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-foreground">
          <Sparkles size={18} className="text-primary" />
          Get more credits
        </DialogTitle>
        <DialogDescription>
          1 credit cleans 1 file. Pick a pack that fits your workload.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        {packs.map((p) => (
          <div
            key={p.credits}
            className="flex items-center justify-between rounded-xl border border-border p-4"
          >
            <div>
              <p className="font-semibold text-foreground flex items-center gap-2">
                {p.credits} credits
                {p.best && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Best value
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Cleans up to {p.credits} files
              </p>
            </div>
            <Button
              variant={p.best ? "default" : "outline"}
              className="rounded-full"
              onClick={() => toast.info("Payments are coming soon.")}
            >
              ₹{p.price}
            </Button>
          </div>
        ))}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check size={14} className="text-accent" />
          Credits never expire
        </p>
      </div>
    </DialogContent>
  </Dialog>
);
