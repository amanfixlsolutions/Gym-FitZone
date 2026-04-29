import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, change, changeLabel, icon: Icon, iconBg, iconColor, positive }) {
  const isPositive = positive !== undefined ? positive : change >= 0;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-[var(--muted)]">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={17} className={iconColor} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text)] mb-1">{value}</p>
      <div className="flex items-center gap-1.5">
        <span className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
          isPositive ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" : "text-red-500 bg-red-50 dark:bg-red-900/30"
        }`}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(change)}%
        </span>
        <span className="text-xs text-[var(--muted2)]">{changeLabel || "vs last period"}</span>
      </div>
    </div>
  );
}
