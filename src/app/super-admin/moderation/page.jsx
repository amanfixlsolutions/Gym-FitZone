"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { Flag, CheckCircle, XCircle, AlertTriangle, Eye, Search, Filter } from "lucide-react";

const reports = [
  { id: "RPT001", type: "Review",  content: "Inappropriate language in review",        reporter: "Gym Owner", target: "Iron Paradise Review",  date: "Jan 28, 2025", severity: "Medium", status: "Pending" },
  { id: "RPT002", type: "Photo",   content: "Offensive image uploaded to gallery",     reporter: "Member",    target: "PowerHouse Gallery",    date: "Jan 27, 2025", severity: "High",   status: "Pending" },
  { id: "RPT003", type: "Dispute", content: "Refund not processed after cancellation", reporter: "Member",    target: "FitLife Studio",        date: "Jan 26, 2025", severity: "High",   status: "In Review" },
  { id: "RPT004", type: "Review",  content: "Fake review suspected",                   reporter: "System",    target: "Zen Yoga Review",       date: "Jan 25, 2025", severity: "Low",    status: "Resolved" },
  { id: "RPT005", type: "Dispute", content: "Membership not activated after payment",  reporter: "Member",    target: "CrossFit Arena",        date: "Jan 24, 2025", severity: "High",   status: "Resolved" },
  { id: "RPT006", type: "Review",  content: "Spam review with fake rating",            reporter: "System",    target: "FitLife Studio",        date: "Jan 23, 2025", severity: "Medium", status: "Pending" },
];

const severityCls = {
  High:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Low:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};
const statusCls = {
  Pending:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "In Review": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Resolved:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function Page() {
  return (
    <RoleDashboardLayout title="Moderation" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Content Moderation</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Handle reports, disputes and inappropriate content</p>
        </div>

        {/* Stats — static classes, no dynamic color */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
              <Flag size={16} className="text-red-600" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-[var(--text)]">47</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Open Reports</p>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3">
              <Eye size={16} className="text-blue-600" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-[var(--text)]">12</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">In Review</p>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-[var(--text)]">8</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Resolved Today</p>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-3">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-[var(--text)]">23</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Payment Disputes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search reports..." className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm w-fit">
            <Filter size={14} /> Filter
          </button>
          {["All", "Pending", "In Review", "Resolved"].map((f) => (
            <button key={f} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${f === "All" ? "bg-violet-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"}`}>{f}</button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Active Reports & Disputes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["ID", "Type", "Description", "Reporter", "Target", "Date", "Severity", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{r.id}</td>
                    <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-0.5 bg-[var(--surface2)] rounded-full text-[var(--muted)]">{r.type}</span></td>
                    <td className="px-4 py-3 text-sm text-[var(--text)] max-w-[180px] truncate">{r.content}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{r.reporter}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{r.target}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${severityCls[r.severity]}`}>{r.severity}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[r.status]}`}>{r.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="Resolve"><CheckCircle size={14} className="text-emerald-500" /></button>
                        <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Dismiss"><XCircle size={14} className="text-red-500" /></button>
                      </div>
                    </td>
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
