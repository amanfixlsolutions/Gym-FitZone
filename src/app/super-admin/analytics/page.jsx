"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { analyticsAPI, paymentAPI } from "@/lib/api";
import RevenueChart    from "@/components/RevenueChart";
import AttendanceChart from "@/components/AttendanceChart";
import RetentionGauge  from "@/components/RetentionGauge";
import PlanDistribution from "@/components/PlanDistribution";
import TopGymsTable    from "@/components/TopGymsTable";
import RecentActivity  from "@/components/RecentActivity";
import {
  TrendingUp, Users, Building2, BarChart3,
  Download, RefreshCw, UserPlus, CreditCard,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const fmtMoney = (v) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(2)}Cr`
  : v >= 100000 ? `₹${(v / 100000).toFixed(2)}L`
  : `₹${(v || 0).toLocaleString()}`;

// ── Growth Chart (members or gyms per month) ───────────────────────
function GrowthChart({ data = [], label = "New Members", color = "#7c3aed" }) {
  const chartData = data.map(d => ({ month: d.month, count: d.count || 0 }));
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <p className="text-sm font-semibold text-[var(--text)] mb-4">{label}</p>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted2)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted2)" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }}
            formatter={(v) => [v.toLocaleString(), label]}
          />
          <Area type="monotone" dataKey="count" stroke={color} strokeWidth={2.5}
            fill={`url(#grad-${label})`} dot={false}
            activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── City Revenue Bar Chart ─────────────────────────────────────────
function CityRevenueChart({ data = [] }) {
  const chartData = data.map(d => ({
    city:    d._id || "Unknown",
    revenue: d.revenue || 0,
  }));
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <p className="text-sm font-semibold text-[var(--text)] mb-4">Top Cities by Revenue</p>
      {chartData.length === 0 ? (
        <p className="text-sm text-[var(--muted)] text-center py-8">No city data yet</p>
      ) : (
        <div className="space-y-3">
          {chartData.map((item, i) => {
            const pct = Math.round((item.revenue / maxRevenue) * 100);
            return (
              <div key={item.city} className="flex items-center gap-3">
                <span className="text-sm text-[var(--text)] w-24 flex-shrink-0 truncate">{item.city}</span>
                <div className="flex-1 bg-[var(--surface2)] rounded-full h-2">
                  <div className="bg-violet-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-semibold text-[var(--text)] w-16 text-right whitespace-nowrap">
                  {fmtMoney(item.revenue)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function Page() {
  const [data,    setData]    = useState(null);
  const [revenue, setRevenue] = useState({ total: 0, monthly: 0, chart: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, revenueRes] = await Promise.all([
        analyticsAPI.superAdminDashboard(),
        paymentAPI.revenue(),
      ]);
      setData(analyticsRes.data || null);
      setRevenue(revenueRes.data || {});
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = data?.stats || {};
  const avgRevenuePerGym = stats.activeGyms > 0
    ? Math.round((revenue.monthly || 0) / stats.activeGyms)
    : 0;

  // Export CSV
  const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Platform GMV",      revenue.total],
      ["Monthly Revenue",   revenue.monthly],
      ["Total Members",     stats.totalMembers   || 0],
      ["Active Members",    stats.activeMembers  || 0],
      ["Total Gyms",        stats.totalGyms      || 0],
      ["Active Gyms",       stats.activeGyms     || 0],
      ["Total Trainers",    stats.totalTrainers  || 0],
      ["Commission Earned", stats.commissionEarned || 0],
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "analytics-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Skeleton stat card
  const StatCard = ({ label, value, change, icon: Icon }) => (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center mb-3">
        <Icon size={16} className="text-violet-600" />
      </div>
      {loading
        ? <div className="h-7 bg-[var(--surface2)] rounded animate-pulse w-24 mb-1" />
        : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{value}</p>}
      <p className="text-xs text-[var(--muted)] mt-0.5">{label}</p>
      {!loading && change !== undefined && (
        <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">{change}</span>
      )}
    </div>
  );

  return (
    <RoleDashboardLayout title="Platform Analytics" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Platform Analytics</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Platform-wide metrics, growth charts and retention curves
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm cursor-pointer">
              <Download size={15} /> Export Report
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Platform GMV"    value={fmtMoney(revenue.total)}                icon={TrendingUp} />
          <StatCard label="Total Members"   value={(stats.totalMembers  || 0).toLocaleString()} icon={Users} />
          <StatCard label="Active Gyms"     value={(stats.activeGyms    || 0).toLocaleString()} icon={Building2} />
          <StatCard label="Avg Rev / Gym"   value={fmtMoney(avgRevenuePerGym)}             icon={BarChart3} />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Members",    value: (stats.activeMembers  || 0).toLocaleString(), icon: Users },
            { label: "Total Trainers",    value: (stats.totalTrainers  || 0).toLocaleString(), icon: UserPlus },
            { label: "Commission Earned", value: fmtMoney(stats.commissionEarned),             icon: CreditCard },
            { label: "Pending Gyms",      value: (stats.pendingGyms    || 0).toLocaleString(), icon: Building2 },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                {loading
                  ? <div className="h-6 bg-[var(--surface2)] rounded animate-pulse w-16" />
                  : <p className="text-lg font-bold text-[var(--text)]">{s.value}</p>}
                <s.icon size={16} className="text-[var(--muted2)]" />
              </div>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart + Attendance + Retention */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <RevenueChart
              data={revenue.chart}
              totalRevenue={revenue.total}
              activeMembers={stats.activeMembers}
              newJoins={stats.totalMembers}
            />
          </div>
          <div className="flex flex-col gap-4">
            <AttendanceChart data={data?.attendanceChart} />
            <RetentionGauge
              active={stats.activeMembers || 0}
              total={stats.totalMembers   || 0}
            />
          </div>
        </div>

        {/* Plan Distribution + City Revenue */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <PlanDistribution data={data?.planDistribution} />
          <CityRevenueChart data={data?.cityRevenue} />
        </div>

        {/* Member Growth + Gym Growth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GrowthChart
            data={data?.memberGrowth}
            label="New Members / Month"
            color="#2563eb"
          />
          <GrowthChart
            data={data?.gymGrowth}
            label="New Gyms / Month"
            color="#7c3aed"
          />
        </div>

        {/* Top Gyms + Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <TopGymsTable  data={data?.topGyms} />
          <RecentActivity data={data?.recentActivity} />
        </div>

      </div>
    </RoleDashboardLayout>
  );
}
