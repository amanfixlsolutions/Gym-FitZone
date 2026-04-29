"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { Search, Filter, Download, TrendingUp, TrendingDown } from "lucide-react";

const txns = [
  { id: "#T5041", member: "Rahul Sharma",  gym: "Iron Paradise",  type: "Subscription", amount: "+₹2,999", commission: "₹300",  date: "Jan 28, 2025", method: "UPI",    status: "Success" },
  { id: "#T5040", member: "Priya Mehta",   gym: "PowerHouse Gym", type: "Class Pass",   amount: "+₹299",   commission: "₹30",   date: "Jan 28, 2025", method: "Card",   status: "Success" },
  { id: "#T5039", member: "Amit Kumar",    gym: "FitLife Studio", type: "Refund",       amount: "-₹1,499", commission: "-₹150", date: "Jan 27, 2025", method: "Wallet", status: "Processed" },
  { id: "#T5038", member: "Sneha Patel",   gym: "Zen Yoga",       type: "Subscription", amount: "+₹5,999", commission: "₹600",  date: "Jan 27, 2025", method: "UPI",    status: "Success" },
  { id: "#T5037", member: "Vikram Singh",  gym: "CrossFit Arena", type: "Subscription", amount: "+₹1,499", commission: "₹150",  date: "Jan 26, 2025", method: "Card",   status: "Failed" },
  { id: "#T5036", member: "Neha Joshi",    gym: "Iron Paradise",  type: "Day Pass",     amount: "+₹199",   commission: "₹20",   date: "Jan 26, 2025", method: "Wallet", status: "Success" },
];
const statusCls = { Success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", Failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", Processed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };

export default function Page() {
  return (
    <RoleDashboardLayout title="Transactions" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">All Transactions</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform-wide payment records with commission tracking</p>
          </div>
          <button className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm w-fit"><Download size={15} /> Export</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Collected",    value: "₹28.3L", icon: TrendingUp,   color: "emerald" },
            { label: "Commission Earned",  value: "₹2.83L", icon: TrendingUp,   color: "violet" },
            { label: "Total Refunds",      value: "₹1.2L",  icon: TrendingDown, color: "red" },
            { label: "Failed Payments",    value: "₹0.4L",  icon: TrendingDown, color: "amber" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg bg-${s.color}-100 dark:bg-${s.color}-900/20 flex items-center justify-center mb-2`}>
                <s.icon size={16} className={`text-${s.color}-600`} />
              </div>
              <p className="text-xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search transactions..." className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm w-fit"><Filter size={14} /> Filter</button>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["Txn ID", "Member", "Gym", "Type", "Amount", "Commission", "Date", "Method", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {txns.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{t.member}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{t.gym}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{t.type}</td>
                    <td className={`px-4 py-3 font-bold whitespace-nowrap ${t.amount.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>{t.amount}</td>
                    <td className="px-4 py-3 font-semibold text-violet-600 whitespace-nowrap">{t.commission}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{t.method}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[t.status]}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
