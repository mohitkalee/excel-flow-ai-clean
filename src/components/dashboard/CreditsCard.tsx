import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CreditsCard = ({
  credits,
  onBuyCredits,
}: {
  credits: number | undefined;
  onBuyCredits: () => void;
}) => (
  <div className="glass-card rounded-xl p-5 mb-8 flex items-center gap-4 justify-between">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Coins className="text-primary" size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">
          {credits ?? "…"} credits left
        </p>
        <p className="text-xs text-muted-foreground">1 credit cleans 1 file.</p>
      </div>
    </div>
    <Button className="rounded-full shrink-0" onClick={onBuyCredits}>
      Get more credits
    </Button>
  </div>
);
