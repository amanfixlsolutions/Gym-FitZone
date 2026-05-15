"use client";
/**
 * LoadingSkeleton — reusable skeleton loading components
 * Used across all three dashboards (member, gym-owner, super-admin)
 * for role-appropriate empty states and loading feedback.
 */

// ── Base pulse block ───────────────────────────────────────────────
export function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

// ── Stat card skeleton (used in dashboards) ────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-9 w-9 rounded-xl" />
      </div>
      <SkeletonBlock className="h-8 w-20 mb-2" />
      <SkeletonBlock className="h-3 w-32" />
    </div>
  );
}

// ── Table row skeleton ─────────────────────────────────────────────
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBlock className={`h-4 ${i === 0 ? "w-32" : "w-20"}`} />
        </td>
      ))}
    </tr>
  );
}

// ── Table skeleton (header + rows) ────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className={`h-4 ${i === 0 ? "w-28" : "w-16"}`} />
        ))}
      </div>
      {/* Rows */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Card list skeleton (member cards, gym cards, etc.) ────────────
export function CardListSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <SkeletonBlock className="h-11 w-11 rounded-full" />
            <div className="flex-1">
              <SkeletonBlock className="h-4 w-28 mb-1.5" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
          <SkeletonBlock className="h-3 w-full mb-2" />
          <SkeletonBlock className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ── Dashboard skeleton (stats + chart + table) ────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Chart placeholder */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <SkeletonBlock className="h-5 w-40 mb-4" />
        <SkeletonBlock className="h-48 w-full rounded-xl" />
      </div>
      {/* Table */}
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}

// ── Profile skeleton ───────────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-28" />
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100">
              <SkeletonBlock className="h-9 w-9 rounded-xl" />
              <div className="flex-1">
                <SkeletonBlock className="h-3 w-16 mb-1.5" />
                <SkeletonBlock className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notification skeleton ──────────────────────────────────────────
export function NotificationSkeleton({ count = 4 }) {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
          <SkeletonBlock className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" />
          <div className="flex-1">
            <SkeletonBlock className="h-3 w-40 mb-1.5" />
            <SkeletonBlock className="h-3 w-56" />
          </div>
          <SkeletonBlock className="h-3 w-8" />
        </div>
      ))}
    </div>
  );
}

// ── Empty state component ──────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title = "No data found",
  message = "Nothing to show here yet.",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-base font-bold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
