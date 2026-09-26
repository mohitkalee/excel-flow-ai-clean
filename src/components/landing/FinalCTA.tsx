import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const FinalCTA = () => {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden p-12 md:p-20 text-center"
          style={{ background: "var(--hero-gradient)" }}
        >
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              Stop Wasting Hours on Excel.
              <br />
              Let AI Handle It.
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-8">
              Join 10,000+ professionals who've automated their data cleaning. Start free — no credit card required.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-8 h-12 shadow-lg"
            >
              Start Free
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
