"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { Activity, Server, Database, Mail, CreditCard, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

const services = [
  { name: "API Server",        status: "Operational", uptime: "99.98%", latency: "42ms",  icon: Server,     bg: "bg-emerald-100 dark:bg-emerald-900/20", color: "text-emerald-600" },
  { name: "Database (MongoDB)",status: "Operational", uptime: "99.99%", latency: "8ms",   icon: Database,   bg: "bg-emerald-100 dark:bg-emerald-900/20", color: "text-emerald-600" },
  { name: "Razorpay Gateway",  status: "Operational", uptime: "99.95%", latency: "120ms", icon: CreditCard, bg: "bg-emerald-100 dark:bg-emerald-900/20", color: "text-emerald-600" },
  { name: "Email Service",     status: "Degraded",    uptime: "98.20%", latency: "340ms", icon: Mail,       bg: "bg-amber-100 dark:bg-amber-900/20",   color: "text-amber-600" },
  { name: "SMS / WhatsApp",    status: "Operational", uptime: "99.80%", latency: "95ms",  icon: Activity,   bg: "bg-emerald-100 dark:bg-emerald-900/20", color: "text-emerald-600" },
];

const recentErrors = [
  { id: "ERR001", service: "Email Service",  message: "SMTP timeout on bulk send",          time: "10 min ago", level: "Warning" },
  { id: "ERR002", service: "Razorpay",       message: "Webhook delivery failed (retry 2/3)", time: "45 min ago", level: "Warning" },
  { id: "ERR003", service: "API Server",     message: "Rate limit hit from IP 103.x.x.x",   time: "2 hr ago",   level: "Info" },
  { id: "ERR004", service: "Database",       message: "Slow query detected (>500ms)",        time: "3 hr ago",   level: "Info" },
];

const levelCls = {
  Warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Error:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Info:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusIcon = {
  Operational: <CheckCircle size={15} className="text-emerald-500" />,
  Degraded:    <AlertTriangle size={15} className="text-amber-500" />,
  Down:        <XCircle size={15} className="text-red-500" />,
};

export default function Page() {
  return (
    <RoleDashboardLayout title="System Health" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">System Health</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Monitor server logs, payment failures and service status</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm w-fit">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Overall status */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">All Systems Operational</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">1 service degraded · Last checked 2 minutes ago</p>
          </div>
        </div>

        {/* Service status */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Service Status</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {services.map((s) => (
              <div key={s.name} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface2)] transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)]">{s.name}</p>
                  <p className="text-xs text-[var(--muted)]">Uptime: {s.uptime} · Latency: {s.latency}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {statusIcon[s.status]}
                  <span className={`text-xs font-semibold ${s.status === "Operational" ? "text-emerald-600" : s.status === "Degraded" ? "text-amber-600" : "text-red-500"}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent errors */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Recent Logs & Errors</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["ID", "Service", "Message", "Time", "Level"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentErrors.map((e) => (
                  <tr key={e.id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{e.id}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{e.service}</td>
                    <td className="px-4 py-3 text-[var(--muted)] max-w-[240px] truncate">{e.message}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{e.time}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelCls[e.level]}`}>{e.level}</span></td>
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
