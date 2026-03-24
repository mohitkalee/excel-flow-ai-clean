import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying it out",
    features: ["100 rows per file", "3 files per month", "Basic formatting fixes", "CSV & Excel support"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals who need more power",
    features: [
      "Unlimited rows",
      "50 files per month",
      "Custom AI instructions",
      "Bulk processing",
      "Priority support",
      "Advanced deduplication",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Business",
    price: "$49",
    period: "/month",
    description: "For teams and heavy usage",
    features: [
      "Everything in Pro",
      "Unlimited files",
      "API access",
      "Team collaboration",
      "Custom templates",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="section-padding">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Save hours of manual work for less than the cost of a coffee. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`rounded-2xl p-8 relative ${
                plan.popular
                  ? "bg-foreground text-background shadow-2xl scale-105"
                  : "glass-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className={`text-lg font-semibold mb-1 ${plan.popular ? "" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-4 ${plan.popular ? "opacity-70" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.popular ? "opacity-60" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check size={16} className={plan.popular ? "text-accent" : "text-accent"} />
                    <span className={plan.popular ? "opacity-90" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? "secondary" : "default"}
                size="lg"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
