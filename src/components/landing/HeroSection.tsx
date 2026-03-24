import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 md:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles size={14} />
            AI-Powered Data Cleaning Engine
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-6">
            Clean Your Excel Data{" "}
            <span className="text-gradient">in Seconds</span>
            <br />
            — No Manual Work
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload messy spreadsheets and let AI fix formatting, remove
            duplicates, and organize your data instantly. Save 5+ hours on
            every dataset.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25">
              Upload Your File
              <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-12">
              Try Demo
            </Button>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-sm text-muted-foreground">
            Trusted by <span className="font-semibold text-foreground">10,000+</span> businesses
            &nbsp;·&nbsp; No credit card required
          </p>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-2xl p-1.5">
            <div className="bg-muted rounded-xl overflow-hidden">
              {/* Before/After preview */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Before */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-destructive/70" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Before</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    {[
                      ["john doe", "03/15/23", "$1,200.5", "new york"],
                      ["JANE SMITH", "2023-03-16", "1200.50", "NY"],
                      ["john doe", "March 15", "$1200", "New York"],
                      ["Bob Wilson", "15/3/2023", "USD 1,201", "new york"],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 py-1.5 px-2 rounded bg-destructive/5 text-foreground/70">
                        {row.map((cell, j) => (
                          <span key={j} className="truncate">{cell}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                {/* After */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">After</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    {[
                      ["John Doe", "2023-03-15", "$1,200.50", "New York"],
                      ["Jane Smith", "2023-03-16", "$1,200.50", "New York"],
                      ["Bob Wilson", "2023-03-15", "$1,201.00", "New York"],
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 py-1.5 px-2 rounded bg-accent/5 text-foreground/90">
                        {row.map((cell, j) => (
                          <span key={j} className="truncate">{cell}</span>
                        ))}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2 text-accent text-xs font-medium">
                      <Sparkles size={12} />
                      1 duplicate removed · 4 formats fixed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
