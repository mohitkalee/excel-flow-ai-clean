import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "E-Commerce Manager",
    content: "ExcelFlow AI saved me 6 hours every week cleaning product data. It catches inconsistencies I would have missed manually.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Agency Director",
    content: "We used to spend an entire day preparing client reports. Now it takes 10 minutes. Absolute game-changer for our team.",
    rating: 5,
  },
  {
    name: "Lisa Park",
    role: "Senior Accountant",
    content: "The date and currency formatting alone is worth the subscription. No more manual fixes across 50+ spreadsheets.",
    rating: 5,
  },
];

const stats = [
  { value: "1M+", label: "Rows Cleaned" },
  { value: "10K+", label: "Happy Users" },
  { value: "5hrs", label: "Avg. Time Saved" },
  { value: "99.9%", label: "Accuracy Rate" },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-tight">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by Data Teams Everywhere
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed mb-4">"{t.content}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
