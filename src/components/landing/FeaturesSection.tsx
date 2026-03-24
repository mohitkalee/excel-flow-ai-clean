import { Copy, Calendar, Columns3, MessageSquare, Layers } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Copy,
    title: "Duplicate Remover",
    description: "Instantly detect and remove duplicate rows across your entire dataset.",
  },
  {
    icon: Calendar,
    title: "Smart Formatting",
    description: "Fix inconsistent dates, currencies, and number formats automatically.",
  },
  {
    icon: Columns3,
    title: "Column Auto-Fix",
    description: "Restructure misaligned columns and standardize header names.",
  },
  {
    icon: MessageSquare,
    title: "Custom AI Instructions",
    description: "Tell the AI exactly what to do — split names, clean phone numbers, and more.",
  },
  {
    icon: Layers,
    title: "Bulk Processing",
    description: "Process multiple files at once. Clean thousands of rows in seconds.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding bg-muted/50">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features, Zero Complexity
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to turn messy spreadsheets into clean, structured data.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-6 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="text-primary" size={22} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
