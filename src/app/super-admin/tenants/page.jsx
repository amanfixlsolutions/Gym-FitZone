"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { superAdminAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Search, RefreshCw, Building2, Eye, XCircle,
  CheckCircle, Clock, ChevronLeft, ChevronRight,
} from "lucide-react";

const fmtMoney = (v = 0) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${v.toLocaleString()}`;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—";

const STATUS_FILTERS = ["all", "active", "trial", "expired", "suspended"];

const statusConfig = {
  active:    { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Active" },
  trial:     { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",             label: "Trial" },
  expired:   { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",                 label: "Expired" },
  suspended: { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",                label: "Suspended" },
  pending:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",         label: "Pending" },
};

const tierConfig = {
  starter:    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  growth:     "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function TenantsPage() {
  const [tenants,    setTenants]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState(null);
  const [actionId,   setActionId]   = useState(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter !== "all") params.status = filter;
      if (search.trim()) params.search = search.trim();

      const res = await superAdminAPI.getTenants(params);
      setTenants(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  // Reset page when filter/search changes
  useEffect(() => { setPage(1); }, [filter, search]);

  // ── Suspend ────────────────────────────────────────────────────
  const handleSuspend = async (tenant) => {
    const confirmed = await confirmToast(`Suspend "${tenant.name}"? Members will lose access.`);
    if (!confirmed) return;
    setActionId(tenant._id + "_suspend");
    try {
      await superAdminAPI.suspendTenant(tenant._id);
      showSuccess(`${tenant.name} suspended.`);
      fetchTenants();
    } catch (err) {
      showError(err.message || "Failed to suspend");
    } finally {
      setActionId(null);
    }
  };

  // ── Reactivate ─────────────────────────────────────────────────
  const handleReactivate = async (tenant) => {
    const confirmed = await confirmToast(`Reactivate "${tenant.name}"?`);
    if (!confirmed) return;
    setActionId(tenant._id + "_reactivate");
    try {
      await superAdminAPI.reactivateTenant(tenant._id);
      showSuccess(`${tenant.name} reactivated!`);
      fetchTenants();
    } catch (err) {
      showError(err.message || "Failed to reactivate");
    } finally {
      setActionId(null);
    }
  };

  // ── Extend Trial ───────────────────────────────────────────────
  const handleExtendTrial = async (tenant) => {
    const confirmed = await confirmToast(`Extend trial for "${tenant.name}" by 7 days?`);
    if (!confirmed) return;
    setActionId(tenant._id + "_trial");
    try {
      await superAdminAPI.extendTrial(tenant._id, 7);
      showSuccess(`Trial extended by 7 days for ${tenant.name}.`);
      fetchTenants();
    } catch (err) {
      showError(err.message || "Failed to extend trial");
    } finally {
      setActionId(null);
    }
  };

  const isActing = (id, suffix) => actionId === id + suffix;

  return (
    <RoleDashboardLayout title="Tenant Management" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Tenant Management</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Manage all gym tenants with health indicators
            </p>
          </div>
          <button
            onClick={fetchTenants}
            className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input
              type="text"
              placeholder="Search by gym name, city or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer capitalize ${
                  filter === f
                    ? "bg-violet-600 text-white"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: "900px" }}>
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {[
                    "Gym Name", "City", "Tier", "Status",
                    "Members", "Monthly Rev", "Last Payment", "Expiry", "Actions",
                  ].map((h) => (
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
                    <td colSpan={9} className="px-4 py-10 text-center">
                      <span className="inline-block w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </td>
                  </tr>
                ) : tenants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                      <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                      No tenants found
                    </td>
                  </tr>
                ) : (
                  tenants.map((t) => {
                    const subStatus = t.subscription?.status || "trial";
                    const sc = statusConfig[t.status] || statusConfig.pending;
                    const subSc = statusConfig[subStatus] || statusConfig.trial;
                    const tierCls = tierConfig[t.subscriptionTier] || tierConfig.starter;

                    return (
                      <tr key={t._id} className="hover:bg-[var(--surface2)] transition-colors">
                        {/* Gym Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(t.name || "G")[0]}
                            </div>
                            <Link
                              href={`/super-admin/tenants/${t._id}`}
                              className="font-medium text-[var(--text)] hover:text-violet-600 transition-colors whitespace-nowrap"
                            >
                              {t.name}
                            </Link>
                          </div>
                        </td>

                        {/* City */}
                        <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                          {t.city || "—"}
                        </td>

                        {/* Tier */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${tierCls}`}>
                            {t.subscriptionTier || "starter"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${sc.cls}`}>
                              {sc.label}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${subSc.cls}`}>
                              Sub: {subSc.label}
                            </span>
                          </div>
                        </td>

                        {/* Members */}
                        <td className="px-4 py-3 text-[var(--text)] whitespace-nowrap">
                          <p className="font-medium">{(t.totalMembers || 0).toLocaleString()}</p>
                          {t.activeMembers > 0 && (
                            <p className="text-[10px] text-emerald-600">{t.activeMembers} active</p>
                          )}
                        </td>

                        {/* Monthly Revenue */}
                        <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">
                          {t.monthlyRevenue > 0 ? fmtMoney(t.monthlyRevenue) : "—"}
                        </td>

                        {/* Last Payment */}
                        <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                          {fmtDate(t.lastPaymentDate || t.subscription?.lastPaidAt)}
                        </td>

                        {/* Expiry */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {t.subscription?.expiryDate ? (
                            <div>
                              <p className="text-xs text-[var(--text)]">
                                {fmtDate(t.subscription.expiryDate)}
                              </p>
                              {t.daysUntilExpiry !== null && (
                                <p className={`text-[10px] font-semibold ${
                                  t.daysUntilExpiry <= 7
                                    ? "text-red-500"
                                    : t.daysUntilExpiry <= 30
                                    ? "text-amber-500"
                                    : "text-emerald-600"
                                }`}>
                                  {t.daysUntilExpiry > 0
                                    ? `${t.daysUntilExpiry}d left`
                                    : "Expired"}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* View */}
                            <Link
                              href={`/super-admin/tenants/${t._id}`}
                              className="p-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)] transition-colors"
                              title="View details"
                            >
                              <Eye size={14} />
                            </Link>

                            {/* Suspend (active) */}
                            {t.status === "active" && (
                              <button
                                onClick={() => handleSuspend(t)}
                                disabled={isActing(t._id, "_suspend")}
                                title="Suspend"
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {isActing(t._id, "_suspend")
                                  ? <span className="w-3.5 h-3.5 border border-red-400/30 border-t-red-400 rounded-full animate-spin inline-block" />
                                  : <XCircle size={14} />}
                              </button>
                            )}

                            {/* Reactivate (suspended/expired) */}
                            {(t.status === "suspended" || t.status === "rejected") && (
                              <button
                                onClick={() => handleReactivate(t)}
                                disabled={isActing(t._id, "_reactivate")}
                                title="Reactivate"
                                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {isActing(t._id, "_reactivate")
                                  ? <span className="w-3.5 h-3.5 border border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin inline-block" />
                                  : <CheckCircle size={14} />}
                              </button>
                            )}

                            {/* Extend Trial */}
                            {(t.subscription?.status === "trial" || t.status === "trial") && (
                              <button
                                onClick={() => handleExtendTrial(t)}
                                disabled={isActing(t._id, "_trial")}
                                title="Extend trial +7 days"
                                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {isActing(t._id, "_trial")
                                  ? <span className="w-3.5 h-3.5 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin inline-block" />
                                  : <Clock size={14} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted2)]">
                Page {pagination.page} of {pagination.pages} · {pagination.total} tenants
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface2)] disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <ChevronLeft size={14} className="text-[var(--muted)]" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface2)] disabled:opacity-40 cursor-pointer transition-colors"
                >
                  <ChevronRight size={14} className="text-[var(--muted)]" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </RoleDashboardLayout>
  );
}
