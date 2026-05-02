"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { paymentAPI, analyticsAPI } from "@/lib/api";
import RevenueChart from "@/components/RevenueChart";
import { Download, PieChart, RefreshCw, TrendingUp, Users, Building2, CreditCard } from "lucide-react";

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
        analyticsAPI.superAdminDashboard(),
      ]);
      setRevenue(revRes.data || {});
      setStats(analyticsRes.data?.stats || null);
      setPlanDist(analyticsRes.data?.planDistribution || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const planColors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500"];
  const totalPlanMembers = planDist.reduce((s, p) => s + p.count, 0);

  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", revenue.total],
      ["Monthly Revenue", revenue.monthly],
      ["Yearly Revenue", revenue.yearly],
      ["Total Members", stats?.totalMembers || 0],
      ["Active Members", stats?.activeMembers || 0],
      ["Total Gyms", stats?.totalGyms || 0],
      ["Active Gyms", stats?.activeGyms || 0],
      ["Commission Earned", stats?.commissionEarned || 0],
      ...planDist.map(p => [`Plan: ${p._id || "Unknown"}`, p.count]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "financial-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RoleDashboardLayout title="Reports" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Financial Reports</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform revenue analytics and downloadable reports</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleExportCSV}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm cursor-pointer">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Revenue",     value: fmtMoney(revenue.total),          icon: TrendingUp,  color: "text-emerald-600" },
            { label: "This Month",        value: fmtMoney(revenue.monthly),         icon: CreditCard,  color: "text-blue-600" },
            { label: "Commission Earned", value: fmtMoney(stats?.commissionEarned), icon: TrendingUp,  color: "text-violet-600" },
            { label: "Active Gyms",       value: (stats?.activeGyms || 0).toString(), icon: Building2, color: "text-amber-600" },
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

        <RevenueChart data={revenue.chart} totalRevenue={revenue.total} activeMembers={stats?.activeMembers} newJoins={stats?.totalMembers} />

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <p className="font-semibold text-[var(--text)] mb-4">Member Distribution by Plan</p>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4 animate-pulse"><div className="h-3 bg-[var(--surface2)] rounded w-40" /><div className="flex-1 h-2 bg-[var(--surface2)] rounded-full" /><div className="h-3 bg-[var(--surface2)] rounded w-12" /></div>)}</div>
          ) : planDist.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-4">No plan data available</p>
          ) : (
            <div className="space-y-3">
              {planDist.map((p, i) => {
                const pct = totalPlanMembers > 0 ? Math.round((p.count / totalPlanMembers) * 100) : 0;
                return (
                  <div key={p._id || i} className="flex items-center gap-4">
                    <span className="text-sm text-[var(--text)] w-44 flex-shrink-0 truncate">{p._id || "Unknown"}</span>
                    <div className="flex-1 bg-[var(--surface2)] rounded-full h-2">
                      <div className={`${planColors[i % planColors.length]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-[var(--text)] w-10 text-right">{p.count}</span>
                    <span className="text-xs text-[var(--muted)] w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <p className="font-semibold text-[var(--text)] mb-4">Revenue Summary</p>
            <div className="space-y-2.5">
              {[
                { label: "Total Platform GMV", value: fmtMoney(revenue.total) },
                { label: "This Month",         value: fmtMoney(revenue.monthly) },
                { label: "This Year",          value: fmtMoney(revenue.yearly) },
                { label: "Commission (10%)",   value: fmtMoney(stats?.commissionEarned) },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-[var(--muted)]">{r.label}</span>
                  {loading ? <div className="h-4 bg-[var(--surface2)] rounded animate-pulse w-20" /> : <span className="text-sm font-bold text-[var(--text)]">{r.value}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <p className="font-semibold text-[var(--text)] mb-4">Platform Overview</p>
            <div className="space-y-2.5">
              {[
                { label: "Total Members",  value: stats?.totalMembers  || 0 },
                { label: "Active Members", value: stats?.activeMembers || 0 },
                { label: "Total Gyms",     value: stats?.totalGyms     || 0 },
                { label: "Active Gyms",    value: stats?.activeGyms    || 0 },
                { label: "Total Trainers", value: stats?.totalTrainers || 0 },
                { label: "Pending Gyms",   value: stats?.pendingGyms   || 0 },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-[var(--muted)]">{r.label}</span>
                  {loading ? <div className="h-4 bg-[var(--surface2)] rounded animate-pulse w-12" /> : <span className="text-sm font-bold text-[var(--text)]">{r.value.toLocaleString()}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Monthly Report",   desc: "Current month breakdown",  period: "MTD" },
            { label: "Quarterly Report", desc: "Last 3 months overview",   period: "QTD" },
            { label: "Annual Report",    desc: "Full year financial data",  period: "YTD" },
          ].map((r) => (
            <div key={r.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/20 rounded-xl flex items-center justify-center mb-3">
                <PieChart size={20} className="text-violet-600" />
              </div>
              <p className="font-semibold text-[var(--text)]">{r.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{r.desc}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-[var(--muted2)] font-medium">{r.period}</span>
                <button onClick={handleExportCSV}
                  className="flex items-center gap-1.5 text-xs text-violet-600 font-medium hover:text-violet-700 cursor-pointer">
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
