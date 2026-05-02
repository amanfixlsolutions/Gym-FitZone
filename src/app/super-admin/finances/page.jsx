"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { paymentAPI, analyticsAPI } from "@/lib/api";
import { iconBg, iconText } from "@/lib/colorMap";
import RevenueChart from "@/components/RevenueChart";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, ArrowLeftRight, FileText,
  PieChart, ArrowRight, RefreshCw,
} from "lucide-react";

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
        analyticsAPI.superAdminDashboard(),
      ]);
      setRevenue(revRes.data || {});
      setPayments(payRes.data || []);
      setStats(analyticsRes.data?.stats || null);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refunds    = payments.filter(p => p.type === "Refund").reduce((s, p) => s + p.amount, 0);
  const commission = stats?.commissionEarned || 0;

  return (
    <RoleDashboardLayout title="Finances" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Finances</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform revenue, commissions and financial reports</p>
          </div>
          <button onClick={fetchData} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
            <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Collected",   value: fmtMoney(revenue.total),   up: true  },
            { label: "Commission Earned", value: fmtMoney(commission),       up: true  },
            { label: "Refunds Issued",    value: fmtMoney(refunds),          up: false },
            { label: "This Month",        value: fmtMoney(revenue.monthly),  up: true  },
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

        {/* Revenue Chart */}
        <RevenueChart
          data={revenue.chart}
          totalRevenue={revenue.total}
          activeMembers={stats?.activeMembers}
          newJoins={stats?.totalMembers}
        />

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: ArrowLeftRight, label: "Transactions", href: "/super-admin/finances/transactions", desc: "All payment records + commission", color: "blue" },
            { icon: FileText,       label: "Invoices",     href: "/super-admin/finances/invoices",     desc: "Platform invoices",              color: "violet" },
            { icon: PieChart,       label: "Reports",      href: "/super-admin/finances/reports",      desc: "Revenue analytics & exports",    color: "emerald" },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:border-violet-300 transition-all group">
              <div className={`w-10 h-10 rounded-xl ${iconBg[item.color]} flex items-center justify-center mb-3`}>
                <item.icon size={20} className={iconText[item.color]} />
              </div>
              <p className="font-semibold text-[var(--text)]">{item.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{item.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-violet-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Recent Transactions</p>
            <Link href="/super-admin/finances/transactions" className="text-xs text-violet-600 font-medium hover:text-violet-700">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Member", "Plan", "Amount", "Commission", "Gateway", "Date", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--muted)]">No transactions yet</td></tr>
                ) : payments.map(p => (
                  <tr key={p._id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{p.memberName}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{p.planName || "—"}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 whitespace-nowrap">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-violet-600 whitespace-nowrap">₹{(p.commissionAmount || 0).toLocaleString()}</td>
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
