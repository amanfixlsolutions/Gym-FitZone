"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { invoiceAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import { Download, Search, RefreshCw, Send, FileText } from "lucide-react";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusCls = {
  Paid:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Sent:      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Draft:     "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Pending:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Overdue:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Cancelled: "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export default function Page() {
  const [invoices,     setInvoices]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sending,      setSending]      = useState(null);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const LIMIT = 20;

  const fetchInvoices = useCallback(async (pg = 1, status = filterStatus) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page: pg };
      if (status !== "All") params.status = status;
      const res = await invoiceAPI.getAll(params);
      setInvoices(res.data || []);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.pages || 1);
      setPage(pg);
    } catch (_) {}
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchInvoices(1, "All"); }, []);

  const handleFilterChange = (s) => { setFilterStatus(s); fetchInvoices(1, s); };

  const handleSend = async (inv) => {
    setSending(inv._id);
    try {
      await invoiceAPI.send(inv._id);
      showSuccess(`Invoice sent to ${inv.memberEmail}`);
      fetchInvoices(page, filterStatus);
    } catch (err) {
      showError(err.message || "Failed to send invoice");
    } finally { setSending(null); }
  };

  const filtered = invoices.filter(inv => {
    if (!search) return true;
    const q = search.toLowerCase();
    return inv.invoiceNumber?.toLowerCase().includes(q) || inv.memberName?.toLowerCase().includes(q) || inv.planName?.toLowerCase().includes(q);
  });

  const handleExport = () => {
    if (!filtered.length) return;
    const headers = ["Invoice #", "Member", "Plan", "Total", "Status", "Date"];
    const rows = filtered.map(inv => [inv.invoiceNumber, inv.memberName, inv.planName || "", inv.total, inv.status, fmtDate(inv.createdAt)]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "invoices.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const paidCount    = invoices.filter(i => i.status === "Paid").length;
  const pendingCount = invoices.filter(i => i.status === "Pending" || i.status === "Sent").length;
  const overdueCount = invoices.filter(i => i.status === "Overdue").length;
  const totalAmount  = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + (i.total || 0), 0);

  return (
    <RoleDashboardLayout title="Invoices" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Invoices</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Member invoices — {totalCount.toLocaleString()} total</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchInvoices(page, filterStatus)}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Invoices", value: totalCount },
            { label: "Paid",           value: paidCount },
            { label: "Pending / Sent", value: pendingCount },
            { label: "Overdue",        value: overdueCount },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              {loading ? <div className="h-7 bg-[var(--surface2)] rounded animate-pulse w-16 mb-1" /> : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value.toLocaleString()}</p>}
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search by invoice #, member, plan..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Paid", "Sent", "Pending", "Overdue", "Draft"].map(s => (
              <button key={s} onClick={() => handleFilterChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${filterStatus === s ? "bg-blue-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"}`}>{s}</button>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Invoice #", "Member", "Plan", "Amount", "Issue Date", "Due Date", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-20" /></td>)}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center">
                    <FileText size={32} className="text-[var(--muted2)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--muted)]">No invoices found</p>
                  </td></tr>
                ) : filtered.map(inv => (
                  <tr key={inv._id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold whitespace-nowrap">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{inv.memberName}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{inv.planName || "—"}</td>
                    <td className="px-4 py-3 font-bold text-[var(--text)] whitespace-nowrap">₹{inv.total?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(inv.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[inv.status] || statusCls.Draft}`}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {inv.status !== "Paid" && inv.status !== "Cancelled" && (
                        <button onClick={() => handleSend(inv)} disabled={sending === inv._id}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer" title="Send Invoice">
                          {sending === inv._id
                            ? <span className="w-3.5 h-3.5 border border-blue-400/40 border-t-blue-500 rounded-full animate-spin inline-block" />
                            : <Send size={13} className="text-blue-600" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">Page {page} of {totalPages} · {totalCount.toLocaleString()} invoices</p>
              <div className="flex gap-2">
                <button onClick={() => fetchInvoices(page - 1, filterStatus)} disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] cursor-pointer">← Prev</button>
                <button onClick={() => fetchInvoices(page + 1, filterStatus)} disabled={page >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] cursor-pointer">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
