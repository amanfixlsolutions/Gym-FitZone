import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { CreditCard, TrendingUp, TrendingDown, FileText, ArrowLeftRight, PieChart, ArrowRight } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";

const transactions = [
  { id: "#T5041", member: "Rahul Sharma", type: "Subscription", amount: "+₹2,999", date: "Jan 28, 2025", method: "UPI", status: "Success" },
  { id: "#T5040", member: "Priya Mehta", type: "Class Pass", amount: "+₹299", date: "Jan 28, 2025", method: "Card", status: "Success" },
  { id: "#T5039", member: "Amit Kumar", type: "Refund", amount: "-₹1,499", date: "Jan 27, 2025", method: "Wallet", status: "Processed" },
  { id: "#T5038", member: "Sneha Patel", type: "Subscription", amount: "+₹5,999", date: "Jan 27, 2025", method: "UPI", status: "Success" },
  { id: "#T5037", member: "Vikram Singh", type: "Subscription", amount: "+₹1,499", date: "Jan 26, 2025", method: "Card", status: "Failed" },
];

export default function FinancesPage() {
  return (
    <DashboardLayout title="Finances">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Finances</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Platform revenue, transactions and financial reports</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: FileText, label: "Invoices", href: "/finances/invoices", desc: "View & download invoices", color: "blue" },
            { icon: ArrowLeftRight, label: "Transactions", href: "/finances/transactions", desc: "All payment records", color: "purple" },
            { icon: PieChart, label: "Reports", href: "/finances/reports", desc: "Revenue analytics", color: "emerald" },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group">
              <div className={`w-10 h-10 rounded-xl ${iconBg[item.color]} flex items-center justify-center mb-3`}>
                <item.icon size={20} className={iconText[item.color]} />
              </div>
              <p className="font-semibold text-[var(--text)]">{item.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{item.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        {/* Revenue stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Revenue (MTD)", value: "₹28.3L", change: "+12.4%", up: true },
            { label: "Platform Commission", value: "₹2.83L", change: "+12.4%", up: true },
            { label: "Refunds Issued", value: "₹1.2L", change: "-3.1%", up: false },
            { label: "Pending Payouts", value: "₹4.5L", change: "+5.2%", up: true },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs text-[var(--muted)] mb-2">{s.label}</p>
              <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.change}
              </span>
            </div>
          ))}
        </div>

        {/* Recent transactions */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Recent Transactions</p>
            <Link href="/finances/transactions" className="text-xs text-blue-600 font-medium hover:text-blue-700">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
              <tr>
                {["ID", "Member", "Type", "Amount", "Date", "Method", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--surface2)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{t.member}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t.type}</td>
                  <td className={`px-4 py-3 font-bold ${t.amount.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>{t.amount}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t.date}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 bg-[var(--surface2)] rounded-full text-[var(--muted)]">{t.method}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      t.status === "Success" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      t.status === "Failed" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
