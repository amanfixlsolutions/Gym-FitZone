"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { superAdminAPI } from "@/lib/api";
import { showError } from "@/lib/toast";
import {
  TrendingUp, DollarSign, Percent, RefreshCw,
  ArrowDownLeft, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const fmtMoney = (v = 0) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(2)}Cr`
  : v >= 100000  ? `₹${(v / 100000).toFixed(2)}L`
  : `₹${v.toLocaleString()}`;

const fmtShort = (v = 0) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
  : v >= 1000  ? `₹${(v / 1000).toFixed(0)}k`
  : `₹${v}`;

// ── Custom Tooltip ─────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-[var(--text)] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-[var(--muted)] capitalize">{p.dataKey}:</span>
          <span className="font-bold text-[var(--text)]">{fmtMoney(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function RevenuePage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getRevenue();
      setData(res.data || null);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  const months = data?.months || [];
  const totals = data?.totals || { gross: 0, commission: 0, net: 0, refunds: 0 };

  const summaryCards = [
    { label: "Total Gross",      value: fmtMoney(totals.gross),      icon: TrendingUp,    color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
    { label: "Total Commission", value: fmtMoney(totals.commission),  icon: Percent,       color: "text-violet-600",  bg: "bg-violet-100 dark:bg-violet-900/20" },
    { label: "Total Net",        value: fmtMoney(totals.net),         icon: DollarSign,    color: "text-blue-600",    bg: "bg-blue-100 dark:bg-blue-900/20" },
    { label: "Total Refunds",    value: fmtMoney(totals.refunds),     icon: ArrowDownLeft, color: "text-red-500",     bg: "bg-red-100 dark:bg-red-900/20" },
  ];

  return (
    <RoleDashboardLayout title="Revenue Breakdown" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Revenue Breakdown</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              12-month gross, commission, net and refund analysis
            </p>
          </div>
          <button
            onClick={fetchRevenue}
            className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              {loading ? (
                <div className="animate-pulse">
                  <div className="w-9 h-9 bg-[var(--surface2)] rounded-xl mb-3" />
                  <div className="h-7 bg-[var(--surface2)] rounded w-24 mb-2" />
                  <div className="h-4 bg-[var(--surface2)] rounded w-28" />
                </div>
              ) : (
                <>
                  <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon size={16} className={card.color} />
                  </div>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{card.label}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* ── Bar Chart ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-violet-600" />
            <p className="font-semibold text-[var(--text)]">Monthly Revenue Breakdown</p>
          </div>

          {loading ? (
            <div className="h-64 bg-[var(--surface2)] rounded-xl animate-pulse" />
          ) : months.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-[var(--muted)]">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={months} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--muted2)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted2)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtShort}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  formatter={(v) => <span className="text-[var(--muted)] capitalize">{v}</span>}
                />
                <Bar dataKey="gross"      fill="#10b981" radius={[3, 3, 0, 0]} name="Gross" />
                <Bar dataKey="commission" fill="#7c3aed" radius={[3, 3, 0, 0]} name="Commission" />
                <Bar dataKey="net"        fill="#2563eb" radius={[3, 3, 0, 0]} name="Net" />
                <Bar dataKey="refunds"    fill="#ef4444" radius={[3, 3, 0, 0]} name="Refunds" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Monthly Breakdown Table ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Monthly Breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: "600px" }}>
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Month", "Gross Revenue", "Commission", "Net Revenue", "Refunds"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center">
                      <span className="inline-block w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </td>
                  </tr>
                ) : months.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                      No data available
                    </td>
                  </tr>
                ) : (
                  [...months].reverse().map((m) => (
                    <tr key={m.month} className="hover:bg-[var(--surface2)] transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{m.month}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">{fmtMoney(m.gross)}</td>
                      <td className="px-4 py-3 font-semibold text-violet-600 whitespace-nowrap">{fmtMoney(m.commission)}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600 whitespace-nowrap">{fmtMoney(m.net)}</td>
                      <td className="px-4 py-3 font-semibold text-red-500 whitespace-nowrap">
                        {m.refunds > 0 ? fmtMoney(m.refunds) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Totals row */}
              {!loading && months.length > 0 && (
                <tfoot className="bg-[var(--surface2)] border-t-2 border-[var(--border)]">
                  <tr>
                    <td className="px-4 py-3 font-bold text-[var(--text)]">Total</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{fmtMoney(totals.gross)}</td>
                    <td className="px-4 py-3 font-bold text-violet-600">{fmtMoney(totals.commission)}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">{fmtMoney(totals.net)}</td>
                    <td className="px-4 py-3 font-bold text-red-500">{fmtMoney(totals.refunds)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </RoleDashboardLayout>
  );
}
