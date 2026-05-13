"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { superAdminAPI } from "@/lib/api";
import PlatformMetrics from "@/components/PlatformMetrics";
import RevenueChart from "@/components/RevenueChart";
import {
  Users, TrendingUp, TrendingDown, DollarSign,
  Percent, BarChart3, RefreshCw, AlertTriangle,
  Clock, Activity, Zap,
} from "lucide-react";

const fmtMoney = (v = 0) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(2)}Cr`
  : v >= 100000  ? `₹${(v / 100000).toFixed(2)}L`
  : `₹${v.toLocaleString()}`;

// ── Skeleton card ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
      <div className="w-10 h-10 bg-[var(--surface2)] rounded-xl mb-3" />
      <div className="h-8 bg-[var(--surface2)] rounded w-24 mb-2" />
      <div className="h-4 bg-[var(--surface2)] rounded w-32" />
    </div>
  );
}

// ── Health badge ───────────────────────────────────────────────────
function HealthBadge({ count, label, color }) {
  const colors = {
    amber:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    red:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    blue:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    gray:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${colors[color] || colors.gray}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
}

export default function ControlCenterPage() {
  const [metrics,  setMetrics]  = useState(null);
  const [revenue,  setRevenue]  = useState(null);
  const [health,   setHealth]   = useState(null);
  const [loading,  setLoading]  = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, revenueRes, healthRes] = await Promise.all([
        superAdminAPI.getMetrics(),
        superAdminAPI.getRevenue(),
        superAdminAPI.getTenantHealth(),
      ]);
      setMetrics(metricsRes.data || null);
      setRevenue(revenueRes.data || null);
      setHealth(healthRes.data || null);
    } catch (_) {
      // silent — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Build chart data from revenue months
  const chartData = revenue?.months?.map((m) => ({
    month: m.month,
    revenue: m.gross || 0,
  })) || [];

  const metricCards = [
    {
      label: "Active Tenants",
      value: loading ? "—" : (metrics?.activeTenants || 0).toLocaleString(),
      icon: Users,
      color: "violet",
    },
    {
      label: "MRR",
      value: loading ? "—" : fmtMoney(metrics?.mrr || 0),
      subValue: "Monthly Recurring Revenue",
      icon: TrendingUp,
      color: "emerald",
    },
    {
      label: "ARR",
      value: loading ? "—" : fmtMoney(metrics?.arr || 0),
      subValue: "Annual Recurring Revenue",
      icon: BarChart3,
      color: "blue",
    },
    {
      label: "Churn Rate",
      value: loading ? "—" : `${metrics?.churnRate || 0}%`,
      subValue: "Last 30 days",
      icon: TrendingDown,
      color: "red",
    },
    {
      label: "Commission Earned",
      value: loading ? "—" : fmtMoney(metrics?.commissionTotal || 0),
      subValue: "Platform total",
      icon: Percent,
      color: "amber",
    },
    {
      label: "Avg Rev / Tenant",
      value: loading ? "—" : fmtMoney(metrics?.avgRevenuePerTenant || 0),
      subValue: "Per active gym",
      icon: DollarSign,
      color: "indigo",
    },
  ];

  return (
    <RoleDashboardLayout title="Control Center" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">
              SaaS Control Center
            </h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Platform-wide metrics, revenue and tenant health
            </p>
          </div>
          <button
            onClick={fetchAll}
            className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw
              size={15}
              className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : metricCards.map((card) => (
                <PlatformMetrics key={card.label} {...card} />
              ))}
        </div>

        {/* ── Revenue Trend ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            {loading ? (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 h-64 animate-pulse">
                <div className="h-4 bg-[var(--surface2)] rounded w-32 mb-4" />
                <div className="h-40 bg-[var(--surface2)] rounded" />
              </div>
            ) : (
              <RevenueChart
                data={chartData}
                totalRevenue={revenue?.totals?.gross || 0}
              />
            )}
          </div>

          {/* ── Revenue Summary ── */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-violet-600" />
              <p className="text-sm font-semibold text-[var(--text)]">12-Month Summary</p>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-[var(--surface2)] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Total Gross",      value: fmtMoney(revenue?.totals?.gross      || 0), color: "text-emerald-600" },
                  { label: "Total Commission", value: fmtMoney(revenue?.totals?.commission || 0), color: "text-violet-600" },
                  { label: "Total Net",        value: fmtMoney(revenue?.totals?.net        || 0), color: "text-blue-600" },
                  { label: "Total Refunds",    value: fmtMoney(revenue?.totals?.refunds    || 0), color: "text-red-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between bg-[var(--surface2)] rounded-xl px-4 py-3">
                    <p className="text-sm text-[var(--muted)]">{s.label}</p>
                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Tenant Health Summary ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)]">
            <AlertTriangle size={16} className="text-amber-500" />
            <p className="font-semibold text-[var(--text)]">Tenant Health Dashboard</p>
          </div>

          {loading ? (
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-[var(--surface2)] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <HealthBadge
                  count={health?.counts?.expiringSoon || 0}
                  label="Expiring Soon"
                  color="amber"
                />
                <HealthBadge
                  count={health?.counts?.trialEnding || 0}
                  label="Trial Ending"
                  color="blue"
                />
                <HealthBadge
                  count={health?.counts?.overduePayments || 0}
                  label="Overdue Payments"
                  color="red"
                />
                <HealthBadge
                  count={health?.counts?.lowActivity || 0}
                  label="Low Activity"
                  color="gray"
                />
              </div>

              {/* Expiring soon list */}
              {health?.expiringSoon?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock size={11} />
                    Expiring within 7 days
                  </p>
                  <div className="space-y-1.5">
                    {health.expiringSoon.slice(0, 5).map((gym) => (
                      <div
                        key={gym._id}
                        className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">{gym.name}</p>
                          <p className="text-xs text-[var(--muted)]">{gym.city}</p>
                        </div>
                        {gym.subscription?.expiryDate && (
                          <p className="text-xs text-amber-600 font-semibold">
                            {new Date(gym.subscription.expiryDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trial ending list */}
              {health?.trialEnding?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Zap size={11} />
                    Trials ending within 7 days
                  </p>
                  <div className="space-y-1.5">
                    {health.trialEnding.slice(0, 5).map((gym) => (
                      <div
                        key={gym._id}
                        className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">{gym.name}</p>
                          <p className="text-xs text-[var(--muted)]">{gym.city}</p>
                        </div>
                        {gym.trialEndsAt && (
                          <p className="text-xs text-blue-600 font-semibold">
                            {new Date(gym.trialEndsAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!health?.expiringSoon?.length &&
               !health?.trialEnding?.length &&
               !health?.overduePayments?.length &&
               !health?.lowActivity?.length && (
                <div className="text-center py-6 text-sm text-[var(--muted)]">
                  <Activity size={24} className="mx-auto mb-2 opacity-30" />
                  All tenants are healthy!
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </RoleDashboardLayout>
  );
}
