"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { useAuth } from "@/context/AuthContext";
import { analyticsAPI, paymentAPI, memberAPI, attendanceAPI } from "@/lib/api";
import RevenueChart from "@/components/RevenueChart";
import AttendanceChart from "@/components/AttendanceChart";
import RetentionGauge from "@/components/RetentionGauge";
import PlanDistribution from "@/components/PlanDistribution";
import { TrendingUp, Users, CreditCard, BarChart3, RefreshCw } from "lucide-react";

export default function Page() {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, revenueRes] = await Promise.all([
        analyticsAPI.gymOwnerDashboard(),
        paymentAPI.revenue(),
      ]);
      setData(analyticsRes.data);
      setRevenue(revenueRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const stats = data?.stats || {};
  const avgCheckins = data?.attendanceChart?.length
    ? Math.round(data.attendanceChart.reduce((s, d) => s + (d.count || 0), 0) / data.attendanceChart.length)
    : 0;
  const retentionPct = stats.totalMembers > 0
    ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
    : 0;

  const kpis = [
    {
      label: "Monthly Revenue",
      value: loading ? "—" : revenue?.monthly >= 100000
        ? `₹${(revenue.monthly / 100000).toFixed(2)}L`
        : `₹${(revenue?.monthly || 0).toLocaleString()}`,
      change: "+8.1%",
      icon: CreditCard,
    },
    {
      label: "Active Members",
      value: loading ? "—" : (stats.activeMembers || 0).toLocaleString(),
      change: "+12.3%",
      icon: Users,
    },
    {
      label: "Avg Check-ins",
      value: loading ? "—" : `${avgCheckins}/day`,
      change: "+5.2%",
      icon: TrendingUp,
    },
    {
      label: "Retention Rate",
      value: loading ? "—" : `${retentionPct}%`,
      change: "+2.1%",
      icon: BarChart3,
    },
  ];

  const gymName = user?.gymName || "Your Gym";

  return (
    <RoleDashboardLayout title="Analytics" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Analytics</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">{gymName} — performance insights</p>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                <s.icon size={16} className="text-blue-600" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
              <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">{s.change}</span>
            </div>
          ))}
        </div>

        {/* Revenue Chart + Attendance + Retention */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <RevenueChart
              data={revenue?.chart}
              totalRevenue={revenue?.total}
              activeMembers={stats.activeMembers}
              newJoins={stats.totalMembers}
            />
          </div>
          <div className="flex flex-col gap-4">
            <AttendanceChart data={data?.attendanceChart} />
            <RetentionGauge
              active={stats.activeMembers || 0}
              total={stats.totalMembers || 0}
            />
          </div>
        </div>

        {/* Plan Distribution + Churn */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <PlanDistribution data={data?.planDistribution} />

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <p className="text-sm font-semibold text-[var(--text)] mb-4">Member Status Breakdown</p>
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Active",   value: stats.activeMembers  || 0, color: "bg-emerald-500", total: stats.totalMembers || 1 },
                  { label: "Paused",   value: stats.pausedMembers  || 0, color: "bg-amber-500",   total: stats.totalMembers || 1 },
                  { label: "Expired",  value: stats.expiredMembers || 0, color: "bg-red-400",     total: stats.totalMembers || 1 },
                ].map((item) => {
                  const pct = Math.round((item.value / item.total) * 100);
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text)] w-16 flex-shrink-0">{item.label}</span>
                      <div className="flex-1 bg-[var(--surface2)] rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-[var(--text)] w-20 text-right">
                        {item.value.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                  );
                })}

                {/* Summary */}
                <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-3">
                  <div className="bg-[var(--surface2)] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-[var(--text)]">{(stats.totalMembers || 0).toLocaleString()}</p>
                    <p className="text-xs text-[var(--muted)]">Total Members</p>
                  </div>
                  <div className="bg-[var(--surface2)] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-emerald-600">{retentionPct}%</p>
                    <p className="text-xs text-[var(--muted)]">Retention Rate</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Summary */}
        {revenue && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Revenue",   value: revenue.total   || 0 },
              { label: "Monthly Revenue", value: revenue.monthly || 0 },
              { label: "Yearly Revenue",  value: revenue.yearly  || 0 },
            ].map(s => (
              <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <p className="text-xs text-[var(--muted)] mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text)]">
                  {s.value >= 100000
                    ? `₹${(s.value / 100000).toFixed(2)}L`
                    : `₹${s.value.toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
