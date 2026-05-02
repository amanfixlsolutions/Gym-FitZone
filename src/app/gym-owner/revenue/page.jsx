"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { paymentAPI, analyticsAPI } from "@/lib/api";
import RevenueChart from "@/components/RevenueChart";
import { TrendingUp, TrendingDown, ArrowLeftRight, FileText, PieChart, ArrowRight, RefreshCw } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";
import Link from "next/link";

const fmtMoney = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${(v || 0).toLocaleString()}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusCls = {
  Success:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Failed:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function Page() {
  const [revenue,  setRevenue]  = useState({ total: 0, monthly: 0, yearly: 0, chart: [] });
  const [payments, setPayments] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, payRes, analyticsRes] = await Promise.all([
        paymentAPI.revenue(),
        paymentAPI.getAll({ limit: 8, page: 1 }),
        analyticsAPI.gymOwnerDashboard(),
      ]);
      setRevenue(revRes.data || {});
      setPayments(payRes.data || []);
      setStats(analyticsRes.data?.stats || null);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refunds = payments.filter(p => p.type === "Refund").reduce((s, p) => s + p.amount, 0);
  const commission = revenue.total ? Math.round(revenue.total * 0.1) : 0;
  const afterCommission = revenue.monthly ? Math.round(revenue.monthly * 0.9) : 0;

  return (
    <RoleDashboardLayout title="Revenue" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Revenue</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Your gym's financial overview</p>
          </div>
          <button onClick={fetchData} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
            <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Revenue (MTD)",      value: fmtMoney(revenue.monthly),    up: true  },
            { label: "After Commission",   value: fmtMoney(afterCommission),    up: true  },
            { label: "Refunds",            value: fmtMoney(refunds),            up: false },
            { label: "Total Revenue",      value: fmtMoney(revenue.total),      up: true  },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs text-[var(--muted)] mb-2">{s.label}</p>
              {loading
                ? <div className="h-7 bg-[var(--surface2)] rounded animate-pulse w-24 mb-1" />
                : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>}
              <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {s.up ? "Revenue" : "Refunds"}
              </span>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: ArrowLeftRight, label: "Transactions", href: "/gym-owner/revenue/transactions", desc: "All payment records", color: "blue" },
            { icon: FileText,       label: "Invoices",     href: "/gym-owner/revenue/invoices",     desc: "Member invoices",   color: "purple" },
            { icon: PieChart,       label: "Reports",      href: "/gym-owner/revenue/reports",      desc: "Revenue analytics", color: "emerald" },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group">
              <div className={`w-10 h-10 rounded-xl ${iconBg[item.color]} flex items-center justify-center mb-3`}>
                <item.icon size={20} className={iconText[item.color]} />
              </div>
              <p className="font-semibold text-[var(--text)]">{item.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{item.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        {/* Revenue Chart */}
        <RevenueChart
          data={revenue.chart}
          totalRevenue={revenue.total}
          activeMembers={stats?.activeMembers}
          newJoins={stats?.totalMembers}
        />

        {/* Recent Transactions */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Recent Transactions</p>
            <Link href="/gym-owner/revenue/transactions" className="text-xs text-blue-600 font-medium hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[550px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Member", "Plan", "Amount", "Gateway", "Date", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-20" /></td>)}
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--muted)]">No transactions yet</td></tr>
                ) : payments.map(p => (
                  <tr key={p._id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{p.memberName}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{p.planName || "—"}</td>
                    <td className={`px-4 py-3 font-bold whitespace-nowrap ${p.type === "Refund" ? "text-red-500" : "text-emerald-600"}`}>
                      {p.type === "Refund" ? "-" : "+"}₹{p.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-[var(--surface2)] rounded-full text-[var(--muted)]">{p.gateway}</span></td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[p.status] || statusCls.Pending}`}>
                        {p.status}
                      </span>
                    </td>
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
