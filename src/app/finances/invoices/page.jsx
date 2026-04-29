import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Download, Search, Filter } from "lucide-react";

const invoices = [
  { id: "INV-2025-001", member: "Rahul Sharma", gym: "Iron Paradise", plan: "Yearly", amount: "₹11,999", date: "Jan 15, 2025", due: "Jan 15, 2025", status: "Paid" },
  { id: "INV-2025-002", member: "Priya Mehta", gym: "PowerHouse Gym", plan: "Quarterly", amount: "₹3,999", date: "Jan 12, 2025", due: "Jan 12, 2025", status: "Paid" },
  { id: "INV-2025-003", member: "Amit Kumar", gym: "FitLife Studio", plan: "Monthly", amount: "₹1,499", date: "Jan 10, 2025", due: "Jan 25, 2025", status: "Pending" },
  { id: "INV-2025-004", member: "Sneha Patel", gym: "Zen Yoga", plan: "Class Pass", amount: "₹2,999", date: "Jan 8, 2025", due: "Jan 8, 2025", status: "Paid" },
  { id: "INV-2025-005", member: "Vikram Singh", gym: "CrossFit Arena", plan: "Monthly", amount: "₹1,499", date: "Dec 28, 2024", due: "Jan 12, 2025", status: "Overdue" },
];

const statusCls = {
  Paid:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function InvoicesPage() {
  return (
    <DashboardLayout title="Invoices">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Invoices</h1>
            <p className="text-sm text-[var(--muted)] mt-1">All membership and class invoices</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} /> Export All
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search invoices..." className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm transition-colors">
            <Filter size={15} /> Filter
          </button>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
              <tr>
                {["Invoice ID", "Member", "Gym", "Plan", "Amount", "Issue Date", "Due Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[var(--surface2)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{inv.id}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{inv.member}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{inv.gym}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{inv.plan}</td>
                  <td className="px-4 py-3 font-bold text-[var(--text)]">{inv.amount}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{inv.date}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{inv.due}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls[inv.status]}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 hover:bg-[var(--surface2)] rounded-lg transition-colors" title="Download">
                      <Download size={14} className="text-[var(--muted)]" />
                    </button>
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
