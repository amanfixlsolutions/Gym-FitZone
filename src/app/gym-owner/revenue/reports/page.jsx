"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { paymentAPI, analyticsAPI } from "@/lib/api";
import RevenueChart from "@/components/RevenueChart";
import { Download, PieChart, RefreshCw, TrendingUp, Users, CreditCard } from "lucide-react";

const fmtMoney = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${(v || 0).toLocaleString()}`;

export default function Page() {
  const [revenue,  setRevenue]  = useState({ total: 0, monthly: 0, yearly: 0, chart: [] });
  const [planDist, setPlanDist] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, analyticsRes] = await Promise.all([
        paymentAPI.revenue(),
        analyticsAPI.gymOwnerDashboard(),
      ]);
      setRevenue(revRes.data || {});
      setStats(analyticsRes.data?.stats || null);

      // Build plan distribution from member stats
      const members = analyticsRes.data?.recentCheckins || [];
      const planMap = {};
      members.forEach(m => {
        const plan = m.memberPlan || "Unknown";
        planMap[plan] = (planMap[plan] || 0) + 1;
      });
      setPlanDist(Object.entries(planMap).map(([name, count]) => ({ name, count })));
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const planColors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-pink-500"];

  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", revenue.total],
      ["Monthly Revenue", revenue.monthly],
      ["Yearly Revenue", revenue.yearly],
      ["Total Members", stats?.totalMembers || 0],
      ["Active Members", stats?.activeMembers || 0],
      ["Total Trainers", stats?.totalTrainers || 0],
      ["Today Check-ins", stats?.todayCheckins || 0],
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "revenue-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RoleDashboardLayout title="Reports" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Revenue Reports</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Download and analyse your gym's financial data</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleExportCSV}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Revenue",   value: fmtMoney(revenue.total),          icon: TrendingUp, color: "text-emerald-600" },
            { label: "This Month",      value: fmtMoney(revenue.monthly),         icon: CreditCard, color: "text-blue-600" },
            { label: "Active Members",  value: (stats?.activeMembers || 0).toString(), icon: Users, color: "text-violet-600" },
            { label: "Today Check-ins", value: (stats?.todayCheckins || 0).toString(), icon: Users, color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                {loading ? <div className="h-7 bg-[var(--surface2)] rounded animate-pulse w-20" /> : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>}
                <s.icon size={18} className={s.color} />
              </div>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <RevenueChart
          data={revenue.chart}
          totalRevenue={revenue.total}
          activeMembers={stats?.activeMembers}
          newJoins={stats?.totalMembers}
        />

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <p className="font-semibold text-[var(--text)] mb-4">Revenue Summary</p>
            <div className="space-y-2.5">
              {[
                { label: "Total Revenue",    value: fmtMoney(revenue.total) },
                { label: "This Month",       value: fmtMoney(revenue.monthly) },
                { label: "This Year",        value: fmtMoney(revenue.yearly) },
                { label: "After Commission", value: fmtMoney(Math.round((revenue.total || 0) * 0.9)) },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-[var(--muted)]">{r.label}</span>
                  {loading ? <div className="h-4 bg-[var(--surface2)] rounded animate-pulse w-20" /> : <span className="text-sm font-bold text-[var(--text)]">{r.value}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <p className="font-semibold text-[var(--text)] mb-4">Gym Overview</p>
            <div className="space-y-2.5">
              {[
                { label: "Total Members",   value: stats?.totalMembers   || 0 },
                { label: "Active Members",  value: stats?.activeMembers  || 0 },
                { label: "Paused Members",  value: stats?.pausedMembers  || 0 },
                { label: "Total Trainers",  value: stats?.totalTrainers  || 0 },
                { label: "Today Classes",   value: stats?.todayClasses   || 0 },
                { label: "Today Check-ins", value: stats?.todayCheckins  || 0 },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-[var(--muted)]">{r.label}</span>
                  {loading ? <div className="h-4 bg-[var(--surface2)] rounded animate-pulse w-12" /> : <span className="text-sm font-bold text-[var(--text)]">{r.value.toLocaleString()}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Download cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Monthly Report",   desc: "Current month breakdown",  period: "MTD" },
            { label: "Quarterly Report", desc: "Last 3 months overview",   period: "QTD" },
            { label: "Annual Report",    desc: "Full year financial data",  period: "YTD" },
          ].map((r) => (
            <div key={r.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-3">
                <PieChart size={20} className="text-blue-600" />
              </div>
              <p className="font-semibold text-[var(--text)]">{r.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{r.desc}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-[var(--muted2)] font-medium">{r.period}</span>
                <button onClick={handleExportCSV}
                  className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 cursor-pointer">
                  <Download size={13} /> Download CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
