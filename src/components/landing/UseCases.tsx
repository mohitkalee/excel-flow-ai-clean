import { ShoppingCart, BarChart3, Calculator } from "lucide-react";
import { motion } from "framer-motion";

const useCases = [
  {
    icon: ShoppingCart,
    title: "E-Commerce Sellers",
    description: "Clean product catalogs, fix SKU formatting, standardize descriptions and pricing across thousands of listings.",
    stat: "2,500+ product rows cleaned per session",
  },
  {
    icon: BarChart3,
    title: "Marketing Agencies",
    description: "Merge client data from multiple sources, deduplicate contacts, and deliver clean reports effortlessly.",
    stat: "Save 8+ hours per client report",
  },
  {
    icon: Calculator,
    title: "Accountants & Finance",
    description: "Standardize transaction records, fix date formats, reconcile currency inconsistencies across financial sheets.",
    stat: "99.9% formatting accuracy",
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="section-padding bg-muted/50">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for Your Industry
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Whether you're selling online, managing clients, or crunching numbers — we've got you covered.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((uc, index) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="glass-card rounded-xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <uc.icon className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{uc.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{uc.description}</p>
              <p className="text-xs font-semibold text-accent">{uc.stat}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
