import { CheckCircle, XCircle, Clock, UserPlus, CreditCard, AlertTriangle, Bell, Building2 } from "lucide-react";
import Link from "next/link";

const typeConfig = {
  member:  { icon: UserPlus,      bg: "bg-blue-50 dark:bg-blue-900/20",    color: "text-blue-600" },
  payment: { icon: CreditCard,    bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "text-emerald-600" },
  gym:     { icon: Building2,     bg: "bg-violet-50 dark:bg-violet-900/20", color: "text-violet-600" },
  alert:   { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-900/20",  color: "text-amber-600" },
  class:   { icon: Clock,         bg: "bg-purple-50 dark:bg-purple-900/20",color: "text-purple-600" },
  trainer: { icon: UserPlus,      bg: "bg-teal-50 dark:bg-teal-900/20",    color: "text-teal-600" },
  system:  { icon: Bell,          bg: "bg-gray-100 dark:bg-gray-800",      color: "text-gray-500" },
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24)  return `${hrs} hr ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export default function RecentActivity({ data }) {
  const activities = data?.length ? data : [];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <p className="text-sm font-semibold text-[var(--text)]">Recent Activity</p>
        <Link href="/super-admin/logs" className="text-xs text-violet-600 font-medium hover:text-violet-700">
          View all →
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-[var(--muted)]">No recent activity</div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {activities.map((item, i) => {
            const tc = typeConfig[item.type] || typeConfig.system;
            const Icon = tc.icon;
            return (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--surface2)] transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                  <Icon size={15} className={tc.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] leading-tight">{item.title || item.action}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{item.message || item.details || item.desc}</p>
                </div>
                <span className="text-[10px] text-[var(--muted2)] whitespace-nowrap mt-0.5">
                  {formatTime(item.createdAt || item.time)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
