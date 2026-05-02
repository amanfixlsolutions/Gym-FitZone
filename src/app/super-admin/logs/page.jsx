"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { logAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  GitBranch, Search, Download, Shield, User, Settings,
  CreditCard, RefreshCw, Trash2, ChevronDown, Clock,
  Users, Package, Bell, BookOpen, Activity,
} from "lucide-react";

const fmtDate = (d) => d ? new Date(d).toLocaleString("en-IN", {
  day: "numeric", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit",
}) : "—";

const fmtRelative = (d) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  return `${days}d ago`;
};

// ── Module → icon/color config ─────────────────────────────────────
const moduleConfig = {
  Members:       { icon: Users,     bg: "bg-blue-100 dark:bg-blue-900/30",       color: "text-blue-600" },
  Trainers:      { icon: User,      bg: "bg-teal-100 dark:bg-teal-900/30",       color: "text-teal-600" },
  Classes:       { icon: Clock,     bg: "bg-purple-100 dark:bg-purple-900/30",   color: "text-purple-600" },
  Gyms:          { icon: Shield,    bg: "bg-violet-100 dark:bg-violet-900/30",   color: "text-violet-600" },
  Plans:         { icon: CreditCard,bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600" },
  Inventory:     { icon: Package,   bg: "bg-amber-100 dark:bg-amber-900/30",     color: "text-amber-600" },
  Notifications: { icon: Bell,      bg: "bg-pink-100 dark:bg-pink-900/30",       color: "text-pink-600" },
  Blog:          { icon: BookOpen,  bg: "bg-indigo-100 dark:bg-indigo-900/30",   color: "text-indigo-600" },
  Settings:      { icon: Settings,  bg: "bg-gray-100 dark:bg-gray-800",          color: "text-gray-600" },
};

const getModuleConfig = (module) =>
  moduleConfig[module] || { icon: Activity, bg: "bg-gray-100 dark:bg-gray-800", color: "text-gray-500" };

const statusCls = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  failed:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const MODULES = ["All", "Members", "Trainers", "Classes", "Gyms", "Plans", "Inventory", "Notifications", "Blog", "Settings"];

export default function Page() {
  const [logs,         setLogs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterModule, setFilterModule] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const [clearing,     setClearing]     = useState(false);

  const LIMIT = 25;

  // ── Fetch logs ─────────────────────────────────────────────────
  const fetchLogs = useCallback(async (pg = 1, mod = filterModule, status = filterStatus, q = search) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page: pg };
      if (mod    !== "All") params.module = mod;
      if (status !== "All") params.status = status;
      if (q.trim())         params.search = q.trim();
      const res = await logAPI.getAll(params);
      setLogs(res.data || []);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.pages || 1);
      setPage(pg);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [filterModule, filterStatus, search]);

  useEffect(() => { fetchLogs(1, "All", "All", ""); }, []);

  // ── Search debounce ────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => fetchLogs(1, filterModule, filterStatus, search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Filter changes ─────────────────────────────────────────────
  const handleModuleChange = (m) => { setFilterModule(m); fetchLogs(1, m, filterStatus, search); };
  const handleStatusChange = (s) => { setFilterStatus(s); fetchLogs(1, filterModule, s, search); };

  // ── Clear old logs ─────────────────────────────────────────────
  const handleClear = async () => {
    const confirmed = await confirmToast("Clear all activity logs older than 30 days? This cannot be undone.");
    if (!confirmed) return;
    setClearing(true);
    try {
      const before = new Date(Date.now() - 30 * 86400000).toISOString();
      await logAPI.clear(before);
      showSuccess("Old logs cleared successfully");
      fetchLogs(1, filterModule, filterStatus, search);
    } catch (err) {
      showError(err.message || "Failed to clear logs");
    } finally {
      setClearing(false);
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────
  const handleExport = () => {
    if (!logs.length) return;
    const headers = ["Action", "Module", "User", "Role", "Details", "Status", "IP", "Time"];
    const rows = logs.map(l => [
      l.action?.replace(/_/g, " ") || "",
      l.module || "",
      l.userName || "System",
      l.role || "",
      l.details || "",
      l.status || "success",
      l.ip || "",
      fmtDate(l.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "activity-logs.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Stats from current page ────────────────────────────────────
  const todayLogs   = logs.filter(l => {
    const d = new Date(l.createdAt);
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;
  const failedLogs  = logs.filter(l => l.status === "failed").length;
  const uniqueUsers = new Set(logs.map(l => l.userName).filter(Boolean)).size;

  return (
    <RoleDashboardLayout title="Activity Logs" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Activity Logs</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Full audit trail of all admin actions — {totalCount.toLocaleString()} total
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => fetchLogs(page, filterModule, filterStatus, search)}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm cursor-pointer">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={handleClear} disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 rounded-lg hover:bg-red-100 text-sm cursor-pointer disabled:opacity-60">
              {clearing
                ? <span className="w-3.5 h-3.5 border border-red-400/40 border-t-red-500 rounded-full animate-spin" />
                : <Trash2 size={14} />}
              Clear Old Logs
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Logs",    value: totalCount.toLocaleString() },
            { label: "Today",         value: todayLogs.toLocaleString() },
            { label: "Failed Actions",value: failedLogs.toLocaleString() },
            { label: "Active Users",  value: uniqueUsers.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              {loading
                ? <div className="h-7 bg-[var(--surface2)] rounded animate-pulse w-16 mb-1" />
                : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>}
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search action, details, user..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>

          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {["All", "success", "failed", "warning"].map(s => (
              <button key={s} onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize whitespace-nowrap ${
                  filterStatus === s
                    ? "bg-violet-600 text-white"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
                }`}>{s}</button>
            ))}
          </div>

          {/* Module filter */}
          <div className="relative">
            <select value={filterModule} onChange={e => handleModuleChange(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] focus:outline-none appearance-none cursor-pointer">
              {MODULES.map(m => <option key={m} value={m}>{m === "All" ? "All Modules" : m}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Module", "Action", "User", "Details", "Status", "IP", "Time"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <GitBranch size={36} className="text-[var(--muted2)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--muted)]">No activity logs found</p>
                    </td>
                  </tr>
                ) : logs.map((l, i) => {
                  const mc   = getModuleConfig(l.module);
                  const Icon = mc.icon;
                  return (
                    <tr key={l._id || i} className="hover:bg-[var(--surface2)] transition-colors">

                      {/* Module */}
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${mc.bg} ${mc.color}`}>
                          <Icon size={11} />
                          {l.module || "System"}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">
                        {l.action?.replace(/_/g, " ") || "—"}
                      </td>

                      {/* User */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">{l.userName || "System"}</p>
                          {l.role && (
                            <p className="text-[10px] text-[var(--muted)] capitalize">{l.role.replace("-", " ")}</p>
                          )}
                        </div>
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3 text-[var(--muted)] max-w-[220px] truncate" title={l.details}>
                        {l.details || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${statusCls[l.status] || statusCls.success}`}>
                          {l.status || "success"}
                        </span>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 font-mono text-xs text-[var(--muted2)] whitespace-nowrap">
                        {l.ip || "—"}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                        <p>{fmtRelative(l.createdAt)}</p>
                        <p className="text-[10px] text-[var(--muted2)]">{fmtDate(l.createdAt)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">
                Page {page} of {totalPages} · {totalCount.toLocaleString()} logs
              </p>
              <div className="flex gap-2">
                <button onClick={() => fetchLogs(page - 1, filterModule, filterStatus, search)} disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] cursor-pointer">
                  ← Prev
                </button>
                <button onClick={() => fetchLogs(page + 1, filterModule, filterStatus, search)} disabled={page >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] cursor-pointer">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
