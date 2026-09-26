import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ShieldCheck, Sparkles, TimerReset, WandSparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="hero-surface relative pt-32 pb-16 md:pt-44 md:pb-24 px-4 md:px-8 overflow-hidden">
      <div className="container-tight grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-7">
            <Sparkles size={14} />
            AI-Powered Data Cleaning
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[4.25rem] font-bold text-foreground leading-[1.02] mb-6">
            Chaos to Clean Data
            <span className="block text-primary">in Seconds</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            Stop wasting hours on messy spreadsheets. Upload your Excel or CSV file, and let AI automatically remove duplicates, fix formatting, and organize your data perfectly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Button size="lg" className="text-base px-8 h-12 rounded-full shadow-lg shadow-primary/25">
              Start Cleaning Free
              <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-12 rounded-full bg-background">
              See How It Works
            </Button>
          </div>

          <div className="mt-9 pt-7 border-t border-border flex flex-wrap items-center justify-center lg:justify-start gap-x-7 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-accent" /> Secure file processing</span>
            <span className="flex items-center gap-2"><TimerReset size={18} className="text-accent" /> Save 5+ hours/week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-xl mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl p-6 md:p-7 shadow-2xl shadow-foreground/10">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-muted-foreground">Before &amp; After</p>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Live Preview</span>
            </div>
            <div>
                <div>
                  <div className="flex items-center gap-2 mb-3 text-destructive">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="text-xs font-semibold">Messy Data</span>
                  </div>
                  <div className="rounded-xl border border-destructive/15 bg-destructive/5 p-3 space-y-1.5 font-mono text-xs">
                    {[
                      ["john doe", "03/15/23", "$1,200.5", "new york"],
                      ["JANE SMITH", "2023-03-16", "1200.50", "NY"],
                      ["john doe", "March 15", "$1200", "New York"],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 text-muted-foreground">
                        {row.map((cell, j) => (
                          <span key={j} className="truncate">{cell}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center py-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <WandSparkles className="text-primary" size={19} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3 text-accent">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-xs font-semibold">Clean Data</span>
                  </div>
                  <div className="rounded-xl border border-accent/15 bg-accent/5 p-3 space-y-1.5 font-mono text-xs">
                    <div className="grid grid-cols-4 gap-2 pb-1 border-b border-accent/20 text-muted-foreground font-semibold">
                      <span>Name</span><span>Date</span><span>Amount</span><span>Location</span>
                    </div>
                    {[
                      ["John Doe", "2023-03-15", "$1,200.50", "New York"],
                      ["Jane Smith", "2023-03-16", "$1,200.50", "New York"],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 text-foreground/80">
                        {row.map((cell, j) => (
                          <span key={j} className="truncate">{cell}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  {[["37", "Duplicates"], ["142", "Dates fixed"], ["318", "Formats fixed"]].map(([value, label]) => (
                    <div key={label} className="rounded-lg bg-muted px-2 py-2">
                      <p className="text-sm font-bold text-foreground">{value}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-accent"><Check size={14} /> Your data is clean</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
