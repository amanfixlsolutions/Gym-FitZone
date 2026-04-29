"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { GitBranch, Search, Filter, Download, Shield, User, Settings, CreditCard } from "lucide-react";

const logs = [
  { id: "LOG001", admin: "Rajiv Sharma",  action: "Approved gym",          target: "Iron Paradise Fitness",  ip: "103.21.x.x", time: "Jan 28, 2025 10:32 AM", type: "gym" },
  { id: "LOG002", admin: "Rajiv Sharma",  action: "Updated commission",     target: "Platform Settings",      ip: "103.21.x.x", time: "Jan 28, 2025 09:15 AM", type: "settings" },
  { id: "LOG003", admin: "Rajiv Sharma",  action: "Rejected gym",           target: "Alpha Fitness",          ip: "103.21.x.x", time: "Jan 27, 2025 04:45 PM", type: "gym" },
  { id: "LOG004", admin: "Rajiv Sharma",  action: "Resolved dispute",       target: "RPT003 – FitLife Studio",ip: "103.21.x.x", time: "Jan 27, 2025 02:10 PM", type: "moderation" },
  { id: "LOG005", admin: "Rajiv Sharma",  action: "Created promo code",     target: "SUMMER30",               ip: "103.21.x.x", time: "Jan 26, 2025 11:00 AM", type: "promo" },
  { id: "LOG006", admin: "Rajiv Sharma",  action: "Suspended gym",          target: "Muscle Factory Old",     ip: "103.21.x.x", time: "Jan 25, 2025 03:30 PM", type: "gym" },
  { id: "LOG007", admin: "Rajiv Sharma",  action: "Sent broadcast",         target: "All Members (16,431)",   ip: "103.21.x.x", time: "Jan 24, 2025 10:00 AM", type: "notification" },
];

const typeConfig = {
  gym:          { icon: Shield,     bg: "bg-blue-100 dark:bg-blue-900/30",       color: "text-blue-600",    label: "Gym" },
  settings:     { icon: Settings,   bg: "bg-violet-100 dark:bg-violet-900/30",   color: "text-violet-600",  label: "Settings" },
  moderation:   { icon: Shield,     bg: "bg-red-100 dark:bg-red-900/30",         color: "text-red-600",     label: "Moderation" },
  promo:        { icon: CreditCard, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600", label: "Promo" },
  notification: { icon: User,       bg: "bg-amber-100 dark:bg-amber-900/30",     color: "text-amber-600",   label: "Notification" },
};

export default function Page() {
  return (
    <RoleDashboardLayout title="Activity Logs" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Activity Logs</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Full audit trail of all admin actions for security</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm w-fit">
            <Download size={14} /> Export Logs
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: "Total Actions", value: "1,284" }, { label: "Today", value: "47" }, { label: "This Week", value: "312" }, { label: "Admins Active", value: "1" }].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search logs..." className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm w-fit">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["ID", "Type", "Admin", "Action", "Target", "IP", "Time"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {logs.map((l) => {
                  const tc = typeConfig[l.type];
                  return (
                    <tr key={l.id} className="hover:bg-[var(--surface2)] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{l.id}</td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${tc.bg} ${tc.color}`}>
                          <tc.icon size={11} />{tc.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{l.admin}</td>
                      <td className="px-4 py-3 text-[var(--text)] whitespace-nowrap">{l.action}</td>
                      <td className="px-4 py-3 text-[var(--muted)] max-w-[180px] truncate">{l.target}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted2)]">{l.ip}</td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{l.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
