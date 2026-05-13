"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * PlatformMetrics — reusable metric card for the super-admin control center.
 *
 * Props:
 *   label     {string}  — card label
 *   value     {string}  — primary display value
 *   subValue  {string}  — optional secondary value shown below
 *   icon      {React.ElementType} — lucide icon component
 *   color     {string}  — tailwind color class for icon bg, e.g. "violet"
 *   trend     {number}  — optional trend percentage (positive = up, negative = down)
 */
export default function PlatformMetrics({
  label,
  value,
  subValue,
  icon: Icon,
  color = "violet",
  trend,
}) {
  const colorMap = {
    violet:  { bg: "bg-violet-100 dark:bg-violet-900/20",  text: "text-violet-600" },
    blue:    { bg: "bg-blue-100 dark:bg-blue-900/20",      text: "text-blue-600" },
    emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/20",text: "text-emerald-600" },
    amber:   { bg: "bg-amber-100 dark:bg-amber-900/20",    text: "text-amber-600" },
    red:     { bg: "bg-red-100 dark:bg-red-900/20",        text: "text-red-600" },
    indigo:  { bg: "bg-indigo-100 dark:bg-indigo-900/20",  text: "text-indigo-600" },
  };

  const { bg, text } = colorMap[color] || colorMap.violet;

  const trendPositive = trend > 0;
  const trendNeutral  = trend === 0 || trend === undefined || trend === null;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-3">
      {/* Icon */}
      {Icon && (
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={text} />
        </div>
      )}

      {/* Value */}
      <div>
        <p className="text-2xl md:text-3xl font-bold text-[var(--text)] leading-tight">
          {value ?? "—"}
        </p>
        {subValue && (
          <p className="text-xs text-[var(--muted)] mt-0.5">{subValue}</p>
        )}
      </div>

      {/* Label + Trend */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted)] font-medium">{label}</p>

        {trend !== undefined && trend !== null && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              trendNeutral
                ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                : trendPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {trendNeutral ? (
              <Minus size={10} />
            ) : trendPositive ? (
              <TrendingUp size={10} />
            ) : (
              <TrendingDown size={10} />
            )}
            {trendNeutral ? "0%" : `${Math.abs(trend)}%`}
          </span>
        )}
      </div>
    </div>
  );
}
