"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { systemAPI, logAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Activity, Server, Database, Mail, CreditCard, CheckCircle, AlertTriangle,
  XCircle, RefreshCw, Cpu, HardDrive, Clock, FileText, Trash2, Search,
  ChevronDown, Shield, Zap, Cloud, Video,
} from "lucide-react";

const fmtDate = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const fmtBytes = (kb) => kb > 1024 ? `${(kb/1024).toFixed(1)} MB` : `${kb} KB`;

const statusConfig = {
  Operational:     { icon: CheckCircle,    cls: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/20", label: "Operational" },
  Configured:      { icon: CheckCircle,    cls: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/20", label: "Configured" },
  "Not Configured":{ icon: AlertTriangle,  cls: "text-amber-500",   bg: "bg-amber-100 dark:bg-amber-900/20",   label: "Not Configured" },
  Degraded:        { icon: AlertTriangle,  cls: "text-amber-500",   bg: "bg-amber-100 dark:bg-amber-900/20",   label: "Degraded" },
  Down:            { icon: XCircle,        cls: "text-red-500",     bg: "bg-red-100 dark:bg-red-900/20",       label: "Down" },
  Connected:       { icon: CheckCircle,    cls: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/20", label: "Connected" },
};

const serviceIcon = {
  "API Server":          Server,
  "Database (MongoDB)":  Database,
  "Email Service":       Mail,
  "Razorpay Gateway":    CreditCard,
  "Stripe Gateway":      CreditCard,
  "Cloudinary":          Cloud,
  "Zoom Integration":    Video,
};

const logStatusCls = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  failed:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ERROR:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  INFO:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function Page() {
  const [health,       setHealth]       = useState(null);
  const [actLogs,      setActLogs]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [logsLoading,  setLogsLoading]  = useState(false);
  const [search,       setSearch]       = useState("");
  const [filterMod,    setFilterMod]    = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [logPage,      setLogPage]      = useState(1);
  const [logTotal,     setLogTotal]     = useState(0);
  const [logPages,     setLogPages]     = useState(1);
  const [activeTab,    setActiveTab]    = useState("services");
  const LOG_LIMIT = 20;

  // ── Fetch health data ──────────────────────────────────────────
  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemAPI.health();
      setHealth(res.data || null);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load system health");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch activity logs ────────────────────────────────────────
  const fetchLogs = useCallback(async (pg = 1, mod = filterMod, status = filterStatus, q = search) => {
    setLogsLoading(true);
    try {
      const params = { limit: LOG_LIMIT, page: pg };
      if (mod    !== "All") params.module = mod;
      if (status !== "All") params.status = status;
      if (q.trim())         params.search = q.trim();
      const res = await systemAPI.logs(params);
      setActLogs(res.data || []);
      setLogTotal(res.pagination?.total || 0);
      setLogPages(res.pagination?.pages || 1);
      setLogPage(pg);
    } catch { /* silent */ }
    finally { setLogsLoading(false); }
  }, [filterMod, filterStatus, search]);

  useEffect(() => { fetchHealth(); fetchLogs(); }, [fetchHealth]);

  // ── Search debounce ────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => fetchLogs(1, filterMod, filterStatus, search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Clear old logs ─────────────────────────────────────────────
  const handleClearLogs = async () => {
    const confirmed = await confirmToast("Clear all activity logs older than 30 days?");
    if (!confirmed) return;
    try {
      const before = new Date(Date.now() - 30 * 86400000).toISOString();
      await logAPI.clear(before);
      showSuccess("Old logs cleared");
      fetchLogs(1, filterMod, filterStatus, search);
      fetchHealth();
    } catch (err) {
      showError(err.message || "Failed to clear logs");
    }
  };

  const server   = health?.server   || {};
  const logs     = health?.logs     || {};
  const services = health?.services || [];
  const errors   = health?.recentErrors || [];

  // Overall status
  const hasDown     = services.some(s => s.status === "Down");
  const hasDegraded = services.some(s => s.status === "Degraded" || s.status === "Not Configured");
  const overallStatus = hasDown ? "down" : hasDegraded ? "degraded" : "ok";

  // Unique modules for filter
  const modules = ["All", ...new Set(actLogs.map(l => l.module).filter(Boolean))];

  return (
    <RoleDashboardLayout title="System Health" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">System Health</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Monitor server status, service health, and activity logs
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { fetchHealth(); fetchLogs(logPage, filterMod, filterStatus, search); }}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm cursor-pointer">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={handleClearLogs}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 rounded-lg hover:bg-red-100 text-sm cursor-pointer">
              <Trash2 size={14} /> Clear Old Logs
            </button>
          </div>
        </div>

        {/* Overall status banner */}
        {loading ? (
          <div className="h-14 bg-[var(--surface)] border border-[var(--border)] rounded-xl animate-pulse" />
        ) : (
          <div className={`border rounded-xl p-4 flex items-center gap-3 ${
            overallStatus === "ok"       ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" :
            overallStatus === "degraded" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" :
            "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}>
            {overallStatus === "ok"
              ? <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
              : overallStatus === "degraded"
              ? <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
              : <XCircle size={20} className="text-red-600 flex-shrink-0" />}
            <div>
              <p className={`font-semibold ${
                overallStatus === "ok" ? "text-emerald-700 dark:text-emerald-400" :
                overallStatus === "degraded" ? "text-amber-700 dark:text-amber-400" :
                "text-red-700 dark:text-red-400"
              }`}>
                {overallStatus === "ok" ? "All Systems Operational" :
                 overallStatus === "degraded" ? "Some Services Need Attention" :
                 "Critical Service Down"}
              </p>
              <p className={`text-xs mt-0.5 ${
                overallStatus === "ok" ? "text-emerald-600 dark:text-emerald-500" :
                overallStatus === "degraded" ? "text-amber-600 dark:text-amber-500" :
                "text-red-600 dark:text-red-500"
              }`}>
                {services.filter(s => s.status === "Operational" || s.status === "Configured").length} of {services.length} services healthy
                {health?.checkedAt ? ` · Checked ${fmtDate(health.checkedAt)}` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Server metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Server Uptime",  value: server.uptimeStr || "—",          icon: Clock },
            { label: "Memory Usage",   value: server.memPct ? `${server.memPct}%` : "—", icon: Cpu },
            { label: "Heap Used",      value: server.memHeapMB ? `${server.memHeapMB} MB` : "—", icon: HardDrive },
            { label: "Activity Logs",  value: (logs.totalActivity || 0).toLocaleString(), icon: FileText },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                {loading
                  ? <div className="h-6 bg-[var(--surface2)] rounded animate-pulse w-20" />
                  : <p className="text-lg font-bold text-[var(--text)]">{s.value}</p>}
                <s.icon size={16} className="text-[var(--muted2)]" />
              </div>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--surface2)] p-1 rounded-xl w-fit">
          {[
            { id: "services", label: "Services" },
            { id: "server",   label: "Server Info" },
            { id: "errors",   label: `Error Log (${errors.length})` },
            { id: "activity", label: `Activity (${logTotal.toLocaleString()})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SERVICES TAB ── */}
        {activeTab === "services" && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <p className="font-semibold text-[var(--text)]">Service Status</p>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {loading ? (
                [...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                    <div className="w-9 h-9 rounded-lg bg-[var(--surface2)]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[var(--surface2)] rounded w-40" />
                      <div className="h-2 bg-[var(--surface2)] rounded w-56" />
                    </div>
                    <div className="h-5 bg-[var(--surface2)] rounded w-20" />
                  </div>
                ))
              ) : services.map((s) => {
                const cfg  = statusConfig[s.status] || statusConfig.Operational;
                const Icon = serviceIcon[s.name] || Activity;
                const StatusIcon = cfg.icon;
                return (
                  <div key={s.name} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface2)] transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={16} className={cfg.cls} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)]">{s.name}</p>
                      <p className="text-xs text-[var(--muted)] truncate">
                        {s.detail}
                        {s.latency !== "—" ? ` · Latency: ${s.latency}` : ""}
                        {s.uptime  !== "—" ? ` · ${s.uptime}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusIcon size={15} className={cfg.cls} />
                      <span className={`text-xs font-semibold ${cfg.cls}`}>{s.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SERVER INFO TAB ── */}
        {activeTab === "server" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <p className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                <Server size={16} className="text-violet-600" /> Process Info
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Node.js",      value: server.nodeVersion },
                  { label: "Platform",     value: `${server.platform} (${server.arch})` },
                  { label: "PID",          value: server.pid },
                  { label: "Environment",  value: server.env },
                  { label: "Uptime",       value: server.uptimeStr },
                  { label: "CPU Cores",    value: server.cpuCount },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                    <span className="text-xs text-[var(--muted)]">{r.label}</span>
                    {loading
                      ? <div className="h-3 bg-[var(--surface2)] rounded animate-pulse w-24" />
                      : <span className="text-xs font-semibold text-[var(--text)] font-mono">{r.value || "—"}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <p className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                <Cpu size={16} className="text-violet-600" /> Memory & Resources
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "RSS Memory",    value: server.memUsedMB ? `${server.memUsedMB} MB` : "—" },
                  { label: "Heap Used",     value: server.memHeapMB ? `${server.memHeapMB} MB` : "—" },
                  { label: "System RAM",    value: server.memTotalMB ? `${server.memTotalMB} MB` : "—" },
                  { label: "RAM Usage",     value: server.memPct ? `${server.memPct}%` : "—" },
                  { label: "Load Avg",      value: server.loadAvg ? server.loadAvg.join(" / ") : "—" },
                  { label: "Log File Size", value: logs.combinedLogSizeKB ? fmtBytes(logs.combinedLogSizeKB) : "—" },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                    <span className="text-xs text-[var(--muted)]">{r.label}</span>
                    {loading
                      ? <div className="h-3 bg-[var(--surface2)] rounded animate-pulse w-20" />
                      : <span className="text-xs font-semibold text-[var(--text)] font-mono">{r.value}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Log stats */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 md:col-span-2">
              <p className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                <FileText size={16} className="text-violet-600" /> Activity Log Stats
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Total Logs",    value: logs.totalActivity || 0,  color: "text-[var(--text)]" },
                  { label: "Success",       value: logs.successLogs   || 0,  color: "text-emerald-600" },
                  { label: "Failed",        value: logs.failedLogs    || 0,  color: "text-red-500" },
                  { label: "Warnings",      value: logs.warningLogs   || 0,  color: "text-amber-600" },
                ].map(s => (
                  <div key={s.label} className="bg-[var(--surface2)] rounded-xl p-3 text-center">
                    {loading
                      ? <div className="h-6 bg-[var(--surface)] rounded animate-pulse w-12 mx-auto mb-1" />
                      : <p className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>}
                    <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {logs.byModule?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--muted)] mb-2">By Module</p>
                  {logs.byModule.map((m, i) => {
                    const pct = logs.totalActivity > 0 ? Math.round((m.count / logs.totalActivity) * 100) : 0;
                    return (
                      <div key={m._id || i} className="flex items-center gap-3">
                        <span className="text-xs text-[var(--text)] w-28 flex-shrink-0">{m._id || "Unknown"}</span>
                        <div className="flex-1 bg-[var(--surface2)] rounded-full h-1.5">
                          <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--text)] w-10 text-right">{m.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ERROR LOG TAB ── */}
        {activeTab === "errors" && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <p className="font-semibold text-[var(--text)]">
                Recent Error Log
                <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                  ({errors.length} recent entries from error.log)
                </span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                  <tr>
                    {["Time", "Level", "Message", "Endpoint", "IP"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(5)].map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-24" /></td>
                        ))}
                      </tr>
                    ))
                  ) : errors.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--muted)]">No errors logged</td></tr>
                  ) : errors.map((e, i) => (
                    <tr key={i} className="hover:bg-[var(--surface2)] transition-colors">
                      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap font-mono">{e.time}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${logStatusCls[e.level] || logStatusCls.ERROR}`}>
                          {e.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text)] max-w-[280px] truncate" title={e.message}>{e.message}</td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap font-mono">
                        {e.method && e.path ? `${e.method} ${e.path}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)] font-mono">{e.ip || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ACTIVITY LOG TAB ── */}
        {activeTab === "activity" && (
          <div className="space-y-3">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                <input type="text" placeholder="Search action, details, user..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["All", "success", "failed", "warning"].map(s => (
                  <button key={s} onClick={() => { setFilterStatus(s); fetchLogs(1, filterMod, s, search); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize whitespace-nowrap ${
                      filterStatus === s ? "bg-violet-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
                    }`}>{s === "All" ? "All" : s}</button>
                ))}
                <div className="relative">
                  <select value={filterMod} onChange={e => { setFilterMod(e.target.value); fetchLogs(1, e.target.value, filterStatus, search); }}
                    className="pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] focus:outline-none appearance-none cursor-pointer">
                    {modules.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[650px]">
                  <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                    <tr>
                      {["Action", "Module", "User", "Details", "Status", "Time"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {logsLoading ? (
                      [...Array(8)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {[...Array(6)].map((_, j) => (
                            <td key={j} className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-20" /></td>
                          ))}
                        </tr>
                      ))
                    ) : actLogs.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--muted)]">No activity logs found</td></tr>
                    ) : actLogs.map((log, i) => (
                      <tr key={log._id || i} className="hover:bg-[var(--surface2)] transition-colors">
                        <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap text-xs">
                          {log.action?.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full font-medium whitespace-nowrap">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                          {log.userName || "System"}
                          {log.role ? <span className="ml-1 opacity-60">({log.role})</span> : null}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--muted)] max-w-[200px] truncate" title={log.details}>
                          {log.details || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${logStatusCls[log.status] || logStatusCls.success}`}>
                            {log.status || "success"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                          {fmtDate(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {logPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted)]">Page {logPage} of {logPages} · {logTotal.toLocaleString()} logs</p>
                  <div className="flex gap-2">
                    <button onClick={() => fetchLogs(logPage - 1, filterMod, filterStatus, search)} disabled={logPage <= 1}
                      className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] cursor-pointer">← Prev</button>
                    <button onClick={() => fetchLogs(logPage + 1, filterMod, filterStatus, search)} disabled={logPage >= logPages}
                      className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] cursor-pointer">Next →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </RoleDashboardLayout>
  );
}
