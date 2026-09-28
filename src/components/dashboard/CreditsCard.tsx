import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const packs = [
  { credits: 50, price: 99 },
  { credits: 100, price: 149, best: true },
];

export const CreditsCard = ({ credits }: { credits: number | undefined }) => (
  <div className="glass-card rounded-xl p-5 mb-8 flex flex-col md:flex-row md:items-center gap-5 justify-between">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
        <Coins className="text-primary" size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{credits ?? "…"} credits</p>
        <p className="text-xs text-muted-foreground">1 credit cleans 1 file. New accounts get 10 free.</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-3">
      {packs.map((p) => (
        <Button
          key={p.credits}
          variant={p.best ? "default" : "outline"}
          className="rounded-full"
          onClick={() => toast.info("Payments are coming soon.")}
        >
          {p.credits} credits · ₹{p.price}
        </Button>
      ))}
    </div>
  </div>
);
