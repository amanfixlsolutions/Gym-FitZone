"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { paymentAPI } from "@/lib/api";
import { iconBg, iconText } from "@/lib/colorMap";
import { Search, Download, TrendingUp, TrendingDown, RefreshCw, ChevronDown } from "lucide-react";

const fmtMoney = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${(v || 0).toLocaleString()}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusCls = {
  Success:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Failed:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function Page() {
  const [payments,     setPayments]     = useState([]);
  const [revenue,      setRevenue]      = useState({ total: 0, monthly: 0 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType,   setFilterType]   = useState("All");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const LIMIT = 20;

  const fetchPayments = useCallback(async (pg = 1, status = filterStatus, type = filterType) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page: pg };
      if (status !== "All") params.status = status;
      if (type   !== "All") params.type   = type;
      const res = await paymentAPI.getAll(params);
      setPayments(res.data || []);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.pages || 1);
      setPage(pg);
    } catch (_) {}
    finally { setLoading(false); }
  }, [filterStatus, filterType]);

  const fetchRevenue = useCallback(async () => {
    try { const res = await paymentAPI.revenue(); setRevenue(res.data || {}); } catch (_) {}
  }, []);

  useEffect(() => { fetchRevenue(); fetchPayments(1, "All", "All"); }, [fetchRevenue]);

  const handleStatusChange = (s) => { setFilterStatus(s); fetchPayments(1, s, filterType); };
  const handleTypeChange   = (t) => { setFilterType(t);   fetchPayments(1, filterStatus, t); };

  const filtered = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.memberName?.toLowerCase().includes(q) || p.planName?.toLowerCase().includes(q) || p.gymName?.toLowerCase().includes(q) || p.gateway?.toLowerCase().includes(q);
  });

  const totalRefunds   = payments.filter(p => p.type === "Refund").reduce((s, p) => s + p.amount, 0);
  const totalFailed    = payments.filter(p => p.status === "Failed").reduce((s, p) => s + p.amount, 0);
  const totalCommission = payments.filter(p => p.status === "Success").reduce((s, p) => s + (p.commissionAmount || 0), 0);

  const handleExport = () => {
    if (!filtered.length) return;
    const headers = ["Member", "Gym", "Plan", "Amount", "Commission", "Gateway", "Type", "Status", "Date"];
    const rows = filtered.map(p => [p.memberName, p.gymName || "", p.planName || "", p.amount, p.commissionAmount || 0, p.gateway, p.type, p.status, fmtDate(p.createdAt)]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RoleDashboardLayout title="Transactions" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">All Transactions</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform-wide payment records — {totalCount.toLocaleString()} total</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { fetchRevenue(); fetchPayments(page, filterStatus, filterType); }}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm cursor-pointer">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Collected",   value: fmtMoney(revenue.total),    icon: TrendingUp,   color: "emerald" },
            { label: "Commission Earned", value: fmtMoney(totalCommission),   icon: TrendingUp,   color: "violet" },
            { label: "Total Refunds",     value: fmtMoney(totalRefunds),      icon: TrendingDown, color: "red" },
            { label: "Failed Payments",   value: fmtMoney(totalFailed),       icon: TrendingDown, color: "amber" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg ${iconBg[s.color]} flex items-center justify-center mb-2`}>
                <s.icon size={16} className={iconText[s.color]} />
              </div>
              {loading ? <div className="h-6 bg-[var(--surface2)] rounded animate-pulse w-20 mb-1" /> : <p className="text-xl font-bold text-[var(--text)]">{s.value}</p>}
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search by member, gym, plan..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Success", "Pending", "Failed", "Refunded"].map(s => (
              <button key={s} onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${filterStatus === s ? "bg-violet-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"}`}>{s}</button>
            ))}
            <div className="relative">
              <select value={filterType} onChange={e => handleTypeChange(e.target.value)}
                className="pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] focus:outline-none appearance-none cursor-pointer">
                <option value="All">All Types</option>
                <option value="Payment">Payment</option>
                <option value="Refund">Refund</option>
                <option value="Commission">Commission</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Txn ID", "Member", "Gym", "Plan", "Amount", "Commission", "Gateway", "Type", "Date", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(10)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-16" /></td>)}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-[var(--muted)]">No transactions found</td></tr>
                ) : filtered.map(p => (
                  <tr key={p._id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{p._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{p.memberName}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{p.gymName || "—"}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{p.planName || "—"}</td>
                    <td className={`px-4 py-3 font-bold whitespace-nowrap ${p.type === "Refund" ? "text-red-500" : "text-emerald-600"}`}>
                      {p.type === "Refund" ? "-" : "+"}₹{p.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-violet-600 whitespace-nowrap">₹{(p.commissionAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-[var(--surface2)] rounded-full text-[var(--muted)]">{p.gateway}</span></td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{p.type}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[p.status] || statusCls.Pending}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">Page {page} of {totalPages} · {totalCount.toLocaleString()} records</p>
              <div className="flex gap-2">
                <button onClick={() => fetchPayments(page - 1, filterStatus, filterType)} disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] cursor-pointer">← Prev</button>
                <button onClick={() => fetchPayments(page + 1, filterStatus, filterType)} disabled={page >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] cursor-pointer">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
