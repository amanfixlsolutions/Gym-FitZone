"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { gymAPI } from "@/lib/api";
import { confirmToast, showSuccess, showError } from "@/lib/toast";
import {
  Search, CheckCircle, XCircle, Eye, MapPin, Star,
  X, RefreshCw, Building2, Users, Mail, Phone,
  AlertTriangle, Calendar, ChevronDown,
} from "lucide-react";

const statusConfig = {
  active:    { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Active" },
  pending:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",         label: "Pending" },
  suspended: { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",                 label: "Suspended" },
  rejected:  { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",                label: "Rejected" },
};

const FILTERS = ["All", "Pending", "Active", "Suspended", "Rejected"];

export default function Page() {
  const [gyms,         setGyms]         = useState([]);
  const [stats,        setStats]        = useState({ total: 0, active: 0, pending: 0, suspended: 0 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState("All");
  const [actionId,     setActionId]     = useState(null);
  const [viewGym,      setViewGym]      = useState(null);
  const [rejectModal,  setRejectModal]  = useState(null); // gym to reject
  const [rejectReason, setRejectReason] = useState("");

  // ── Fetch gyms ─────────────────────────────────────────────────
  const fetchGyms = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (filter !== "All") params.status = filter.toLowerCase();
      if (search) params.search = search;

      const [gymsRes, statsRes] = await Promise.all([
        gymAPI.getAll(params),
        gymAPI.stats(),
      ]);
      setGyms(gymsRes.data || []);
      setStats(statsRes.data || {});
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load gyms");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchGyms(); }, [fetchGyms]);

  // ── Approve ────────────────────────────────────────────────────
  const handleApprove = async (gym) => {
    const confirmed = await confirmToast(`Approve "${gym.name}"?`);
    if (!confirmed) return;
    setActionId(gym._id + "_approve");
    try {
      await gymAPI.approve(gym._id);
      setGyms(p => p.map(g => g._id === gym._id ? { ...g, status: "active" } : g));
      setStats(p => ({ ...p, pending: Math.max(0, p.pending - 1), active: (p.active || 0) + 1 }));
      showSuccess(`${gym.name} approved!`);
      if (viewGym?._id === gym._id) setViewGym(v => ({ ...v, status: "active" }));
    } catch (err) {
      showError(err.message || "Failed to approve");
    } finally {
      setActionId(null);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectModal) return;
    setActionId(rejectModal._id + "_reject");
    try {
      await gymAPI.reject(rejectModal._id, rejectReason || "Does not meet platform requirements");
      setGyms(p => p.map(g => g._id === rejectModal._id ? { ...g, status: "rejected" } : g));
      setStats(p => ({ ...p, pending: Math.max(0, p.pending - 1) }));
      showSuccess(`${rejectModal.name} rejected.`);
      setRejectModal(null); setRejectReason("");
      if (viewGym?._id === rejectModal._id) setViewGym(null);
    } catch (err) {
      showError(err.message || "Failed to reject");
    } finally {
      setActionId(null);
    }
  };

  // ── Suspend ────────────────────────────────────────────────────
  const handleSuspend = async (gym) => {
    const confirmed = await confirmToast(`Suspend "${gym.name}"? Members will lose access.`);
    if (!confirmed) return;
    setActionId(gym._id + "_suspend");
    try {
      await gymAPI.suspend(gym._id);
      setGyms(p => p.map(g => g._id === gym._id ? { ...g, status: "suspended" } : g));
      setStats(p => ({ ...p, active: Math.max(0, p.active - 1), suspended: (p.suspended || 0) + 1 }));
      showSuccess(`${gym.name} suspended.`);
      if (viewGym?._id === gym._id) setViewGym(v => ({ ...v, status: "suspended" }));
    } catch (err) {
      showError(err.message || "Failed to suspend");
    } finally {
      setActionId(null);
    }
  };

  // ── Reactivate ─────────────────────────────────────────────────
  const handleReactivate = async (gym) => {
    const confirmed = await confirmToast(`Reactivate "${gym.name}"?`);
    if (!confirmed) return;
    setActionId(gym._id + "_activate");
    try {
      await gymAPI.approve(gym._id);
      setGyms(p => p.map(g => g._id === gym._id ? { ...g, status: "active" } : g));
      setStats(p => ({ ...p, suspended: Math.max(0, p.suspended - 1), active: (p.active || 0) + 1 }));
      showSuccess(`${gym.name} reactivated!`);
      if (viewGym?._id === gym._id) setViewGym(v => ({ ...v, status: "active" }));
    } catch (err) {
      showError(err.message || "Failed to reactivate");
    } finally {
      setActionId(null);
    }
  };

  // ── Local filter ───────────────────────────────────────────────
  const filtered = gyms.filter(g => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      g.name?.toLowerCase().includes(q) ||
      g.ownerName?.toLowerCase().includes(q) ||
      g.city?.toLowerCase().includes(q);
    const matchFilter = filter === "All" || g.status === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const ActionBtn = ({ loading: isLoading, onClick, icon: Icon, color, title }) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      title={title}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${color}`}
    >
      {isLoading
        ? <span className="w-3.5 h-3.5 border border-current/30 border-t-current rounded-full animate-spin inline-block" />
        : <Icon size={14} />
      }
    </button>
  );

  return (
    <RoleDashboardLayout title="Gym Approvals" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Gym Management</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Review, approve or suspend gyms on the platform</p>
          </div>
          <button onClick={fetchGyms} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer" title="Refresh">
            <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Gyms",       value: stats.total     || 0 },
            { label: "Active",           value: stats.active    || 0 },
            { label: "Pending Approval", value: stats.pending   || 0 },
            { label: "Suspended",        value: stats.suspended || 0 },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value.toLocaleString()}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input
              type="text"
              placeholder="Search gyms by name, owner or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${filter === f ? "bg-violet-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: "700px" }}>
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Gym Name", "Owner", "Location", "Members", "Revenue", "Docs", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center">
                    <span className="inline-block w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                  </td></tr>
                ) : filtered.length === 0 ? ( 
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                    <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                    No gyms found
                  </td></tr>
                ) : filtered.map(g => {
                  const sc = statusConfig[g.status] || statusConfig.pending;
                  const isActing = actionId?.startsWith(g._id);
                  return (
                    <tr key={g._id} className="hover:bg-[var(--surface2)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setViewGym(g)}>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(g.name || "G")[0]}
                          </div>
                          <span className="font-medium text-[var(--text)] hover:text-violet-600 transition-colors whitespace-nowrap">{g.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap text-xs">{g.ownerName || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <MapPin size={11} className="flex-shrink-0" />
                          <span className="whitespace-nowrap">{g.city || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text)] whitespace-nowrap">
                        <div>
                          <p className="font-medium">{(g.totalMembers || 0).toLocaleString()}</p>
                          {g.activeMembers > 0 && (
                            <p className="text-[10px] text-emerald-600">{g.activeMembers} active</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">
                        {g.monthlyRevenue > 0
                          ? g.monthlyRevenue >= 100000
                            ? `₹${(g.monthlyRevenue / 100000).toFixed(2)}L`
                            : `₹${g.monthlyRevenue.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${g.docs?.submitted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {g.docs?.submitted ? "Complete" : "Missing"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <ActionBtn
                            onClick={() => setViewGym(g)}
                            icon={Eye}
                            color="hover:bg-[var(--surface2)] text-[var(--muted)]"
                            title="View details"
                          />
                          {/* Approve (pending) */}
                          {g.status === "pending" && (
                            <ActionBtn
                              loading={actionId === g._id + "_approve"}
                              onClick={() => handleApprove(g)}
                              icon={CheckCircle}
                              color="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500"
                              title="Approve gym"
                            />
                          )}
                          {/* Reject (pending) */}
                          {g.status === "pending" && (
                            <ActionBtn
                              loading={actionId === g._id + "_reject"}
                              onClick={() => { setRejectModal(g); setRejectReason(""); }}
                              icon={XCircle}
                              color="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                              title="Reject gym"
                            />
                          )}
                          {/* Suspend (active) */}
                          {g.status === "active" && (
                            <ActionBtn
                              loading={actionId === g._id + "_suspend"}
                              onClick={() => handleSuspend(g)}
                              icon={XCircle}
                              color="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                              title="Suspend gym"
                            />
                          )}
                          {/* Reactivate (suspended/rejected) */}
                          {(g.status === "suspended" || g.status === "rejected") && (
                            <ActionBtn
                              loading={actionId === g._id + "_activate"}
                              onClick={() => handleReactivate(g)}
                              icon={CheckCircle}
                              color="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500"
                              title="Reactivate gym"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[var(--border)] text-xs text-[var(--muted2)]">
              Showing {filtered.length} of {gyms.length} gyms
            </div>
          )}
        </div>
      </div>

      {/* ── GYM DETAIL MODAL ── */}
      {viewGym && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewGym(null)}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 rounded-t-2xl relative">
              <button onClick={() => setViewGym(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white cursor-pointer transition-colors">
                <X size={16} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-black">
                  {(viewGym.name || "G")[0]}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{viewGym.name}</h2>
                  <p className="text-violet-200 text-sm mt-0.5">{viewGym.city}</p>
                  <span className={`inline-block mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${statusConfig[viewGym.status]?.cls || ""}`}>
                    {statusConfig[viewGym.status]?.label || viewGym.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-b border-[var(--border)]">
              {[
                { label: "Total Members",  value: (viewGym.totalMembers  || 0).toLocaleString() },
                { label: "Active Members", value: (viewGym.activeMembers || 0).toLocaleString() },
                { label: "Rating",         value: viewGym.rating > 0 ? `${viewGym.rating}★` : "—" },
              ].map(s => (
                <div key={s.label} className="py-4 text-center">
                  <p className="text-xl font-black text-[var(--text)]">{s.value}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Owner",       value: viewGym.ownerName || "—" },
                  { label: "Email",       value: viewGym.email     || "—" },
                  { label: "Phone",       value: viewGym.phone     || "—" },
                  { label: "City",        value: viewGym.city      || "—" },
                  { label: "Commission",  value: `${viewGym.commissionRate || 10}%` },
                  { label: "Documents",   value: viewGym.docs?.submitted ? "Submitted" : "Missing" },
                  { label: "Registered",  value: formatDate(viewGym.createdAt) },
                  { label: "Approved",    value: formatDate(viewGym.approvedAt) },
                ].map(f => (
                  <div key={f.label} className="bg-[var(--surface2)] rounded-xl px-4 py-3">
                    <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm font-medium text-[var(--text)] mt-0.5 truncate">{f.value}</p>
                  </div>
                ))}
              </div>

              {viewGym.description && (
                <div className="bg-[var(--surface2)] rounded-xl px-4 py-3">
                  <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-[var(--text)]">{viewGym.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {viewGym.status === "pending" && (
                  <>
                    <button
                      onClick={() => { handleApprove(viewGym); setViewGym(null); }}
                      className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle size={15} /> Approve
                    </button>
                    <button
                      onClick={() => { setRejectModal(viewGym); setViewGym(null); setRejectReason(""); }}
                      className="flex-1 py-2.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold rounded-xl hover:bg-red-200 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </>
                )}
                {viewGym.status === "active" && (
                  <button
                    onClick={() => { handleSuspend(viewGym); setViewGym(null); }}
                    className="flex-1 py-2.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold rounded-xl hover:bg-red-200 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle size={15} /> Suspend Gym
                  </button>
                )}
                {(viewGym.status === "suspended" || viewGym.status === "rejected") && (
                  <button
                    onClick={() => { handleReactivate(viewGym); setViewGym(null); }}
                    className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={15} /> Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT REASON MODAL ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setRejectModal(null)}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">Reject Gym</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Provide a reason for rejecting "{rejectModal.name}"</p>
              </div>
              <button onClick={() => setRejectModal(null)} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Incomplete documentation, does not meet platform standards..."
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRejectModal(null)}
                  className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionId === rejectModal._id + "_reject"}
                  className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {actionId === rejectModal._id + "_reject"
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <XCircle size={15} />
                  }
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}
