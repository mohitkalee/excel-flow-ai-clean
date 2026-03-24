import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const beforeData = [
  { name: "john doe", email: "john@gmial.com", phone: "555-123-4567", date: "03/15/23", amount: "$1,200.5" },
  { name: "JANE SMITH", email: "jane@email.com", phone: "(555) 234 5678", date: "2023-03-16", amount: "1200.50" },
  { name: "john doe", email: "john@gmail.com", phone: "5551234567", date: "March 15", amount: "$1200" },
  { name: "Bob W.", email: "bob@co", phone: "555.345.6789", date: "15/3/2023", amount: "USD 1,201" },
  { name: "JANE SMITH", email: "jane@email.com", phone: "555-234-5678", date: "16-Mar-23", amount: "$1,200.50" },
];

const afterData = [
  { name: "John Doe", email: "john@gmail.com", phone: "(555) 123-4567", date: "2023-03-15", amount: "$1,200.50" },
  { name: "Jane Smith", email: "jane@email.com", phone: "(555) 234-5678", date: "2023-03-16", amount: "$1,200.50" },
  { name: "Bob Wilson", email: "bob@co", phone: "(555) 345-6789", date: "2023-03-15", amount: "$1,201.00" },
];

const BeforeAfter = () => {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See the Transformation
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Watch messy, inconsistent data become perfectly clean and organized.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-destructive" size={18} />
              <span className="font-semibold text-foreground">Before — Messy Data</span>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {["Name", "Email", "Phone", "Date", "Amount"].map((h) => (
                        <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {beforeData.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 bg-destructive/[0.03]">
                        <td className="p-3 text-foreground/70">{row.name}</td>
                        <td className="p-3 text-foreground/70">{row.email}</td>
                        <td className="p-3 text-foreground/70">{row.phone}</td>
                        <td className="p-3 text-foreground/70">{row.date}</td>
                        <td className="p-3 text-foreground/70">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 bg-destructive/5 text-destructive text-xs font-medium">
                ⚠ 2 duplicates · 5 format inconsistencies · 1 typo detected
              </div>
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-accent" size={18} />
              <span className="font-semibold text-foreground">After — Clean Data</span>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {["Name", "Email", "Phone", "Date", "Amount"].map((h) => (
                        <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {afterData.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 bg-accent/[0.03]">
                        <td className="p-3 text-foreground">{row.name}</td>
                        <td className="p-3 text-foreground">{row.email}</td>
                        <td className="p-3 text-foreground">{row.phone}</td>
                        <td className="p-3 text-foreground">{row.date}</td>
                        <td className="p-3 text-foreground">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 bg-accent/5 text-accent text-xs font-medium">
                ✓ Duplicates removed · Formats standardized · Typos fixed
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
