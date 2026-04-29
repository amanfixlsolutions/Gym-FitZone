import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeftRight, Search, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";

const txns = [
  { id: "#T5041", member: "Rahul Sharma", type: "Subscription", amount: "+₹2,999", date: "Jan 28, 2025", method: "UPI", gateway: "Razorpay", status: "Success" },
  { id: "#T5040", member: "Priya Mehta", type: "Class Pass", amount: "+₹299", date: "Jan 28, 2025", method: "Card", gateway: "Razorpay", status: "Success" },
  { id: "#T5039", member: "Amit Kumar", type: "Refund", amount: "-₹1,499", date: "Jan 27, 2025", method: "Wallet", gateway: "Internal", status: "Processed" },
  { id: "#T5038", member: "Sneha Patel", type: "Subscription", amount: "+₹5,999", date: "Jan 27, 2025", method: "UPI", gateway: "Razorpay", status: "Success" },
  { id: "#T5037", member: "Vikram Singh", type: "Subscription", amount: "+₹1,499", date: "Jan 26, 2025", method: "Card", gateway: "Razorpay", status: "Failed" },
  { id: "#T5036", member: "Neha Joshi", type: "Day Pass", amount: "+₹199", date: "Jan 26, 2025", method: "Wallet", gateway: "Internal", status: "Success" },
];

const statusCls = {
  Success:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Failed:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Processed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function TransactionsPage() {
  return (
    <DashboardLayout title="Transactions">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Transactions</h1>
            <p className="text-sm text-[var(--muted)] mt-1">All payment records across the platform</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} /> Export
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Collected", value: "₹28.3L", icon: TrendingUp, color: "emerald" },
            { label: "Total Refunds", value: "₹1.2L", icon: TrendingDown, color: "red" },
            { label: "Failed Payments", value: "₹0.4L", icon: TrendingDown, color: "amber" },
            { label: "Net Revenue", value: "₹26.7L", icon: TrendingUp, color: "blue" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg ${iconBg[s.color]} flex items-center justify-center mb-2`}>
                <s.icon size={16} className={iconText[s.color]} />
              </div>
              <p className="text-xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search transactions..." className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm transition-colors">
            <Filter size={15} /> Filter
          </button>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
              <tr>
                {["Txn ID", "Member", "Type", "Amount", "Date", "Method", "Gateway", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {txns.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--surface2)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{t.member}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t.type}</td>
                  <td className={`px-4 py-3 font-bold ${t.amount.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>{t.amount}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t.date}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t.method}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{t.gateway}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls[t.status]}`}>{t.status}</span>
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
