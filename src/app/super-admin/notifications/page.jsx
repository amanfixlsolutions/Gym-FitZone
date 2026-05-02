"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { notificationAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Bell, Send, Users, Building2, CheckCircle, Trash2,
  AlertTriangle, CreditCard, RefreshCw, X, Search,
  ChevronDown, UserPlus, BookOpen, Zap, Filter,
  Clock, MailOpen, Mail,
} from "lucide-react";

const fmtTime = (d) => {
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

const fmtDate = (d) => d ? new Date(d).toLocaleString("en-IN", {
  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
}) : "—";

// ── Type config (static — no dynamic Tailwind) ─────────────────────
const typeConfig = {
  member:  { icon: UserPlus,      bg: "bg-violet-100 dark:bg-violet-900/30",  color: "text-violet-600" },
  payment: { icon: CreditCard,    bg: "bg-emerald-100 dark:bg-emerald-900/30",color: "text-emerald-600" },
  gym:     { icon: Building2,     bg: "bg-blue-100 dark:bg-blue-900/30",      color: "text-blue-600" },
  alert:   { icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-900/30",    color: "text-amber-600" },
  class:   { icon: Clock,         bg: "bg-purple-100 dark:bg-purple-900/30",  color: "text-purple-600" },
  trainer: { icon: UserPlus,      bg: "bg-teal-100 dark:bg-teal-900/30",      color: "text-teal-600" },
  system:  { icon: Bell,          bg: "bg-gray-100 dark:bg-gray-800",         color: "text-gray-500" },
};

const AUDIENCE_OPTIONS = [
  { value: "all",         label: "All Users" },
  { value: "super-admin", label: "Super Admins" },
  { value: "gym-owners",  label: "Gym Owners" },
  { value: "members",     label: "All Members" },
];

const CHANNEL_OPTIONS = [
  { value: "in-app", label: "In-App" },
  { value: "email",  label: "Email" },
  { value: "sms",    label: "SMS" },
  { value: "push",   label: "Push" },
];

const TYPE_OPTIONS = [
  { value: "system",  label: "System" },
  { value: "alert",   label: "Alert" },
  { value: "payment", label: "Payment" },
  { value: "member",  label: "Member" },
  { value: "gym",     label: "Gym" },
];

const EMPTY_BROADCAST = {
  title: "", message: "", audience: "all", channel: "in-app", type: "system",
};

export default function Page() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterType,    setFilterType]    = useState("All");
  const [filterRead,    setFilterRead]    = useState("All");
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [totalCount,    setTotalCount]    = useState(0);

  // Broadcast form
  const [broadcast,     setBroadcast]     = useState(EMPTY_BROADCAST);
  const [sending,       setSending]       = useState(false);
  const [sendSuccess,   setSendSuccess]   = useState(false);

  const LIMIT = 25;

  // ── Fetch notifications ────────────────────────────────────────
  const fetchNotifications = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page: pg };
      if (filterRead === "Unread") params.unread = "true";
      const res = await notificationAPI.getAll(params);
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.pages || 1);
      setPage(pg);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filterRead]);

  useEffect(() => { fetchNotifications(1); }, [filterRead]);

  // ── Auto-poll every 30s ────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => fetchNotifications(page), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, page]);

  // ── Mark single as read ────────────────────────────────────────
  const handleMarkRead = async (notif) => {
    if (notif.read) return;
    try {
      await notificationAPI.markRead(notif._id);
      setNotifications(prev => prev.map(n =>
        n._id === notif._id ? { ...n, read: true } : n
      ));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  // ── Mark all read ──────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      showSuccess("All notifications marked as read");
      fetchNotifications(page);
    } catch (err) {
      showError(err.message || "Failed");
    }
  };

  // ── Delete single ──────────────────────────────────────────────
  const handleDelete = async (notif) => {
    try {
      await notificationAPI.delete(notif._id);
      setNotifications(prev => prev.filter(n => n._id !== notif._id));
      setTotalCount(c => c - 1);
      if (!notif.read) setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      showError(err.message || "Delete failed");
    }
  };

  // ── Delete all (with confirm) ──────────────────────────────────
  const handleDeleteAll = async () => {
    const confirmed = await confirmToast("Delete all notifications? This cannot be undone.");
    if (!confirmed) return;
    try {
      await Promise.all(notifications.map(n => notificationAPI.delete(n._id)));
      showSuccess("All notifications deleted");
      fetchNotifications(1);
    } catch (err) {
      showError(err.message || "Failed");
    }
  };

  // ── Broadcast ──────────────────────────────────────────────────
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcast.title || !broadcast.message) return;
    setSending(true);
    try {
      await notificationAPI.broadcast(broadcast);
      showSuccess("Notification broadcast sent!");
      setSendSuccess(true);
      setBroadcast(EMPTY_BROADCAST);
      setTimeout(() => setSendSuccess(false), 3000);
      fetchNotifications(1);
    } catch (err) {
      showError(err.message || "Broadcast failed");
    } finally {
      setSending(false);
    }
  };

  const setB = (k, v) => setBroadcast(p => ({ ...p, [k]: v }));

  // ── Client-side filter ─────────────────────────────────────────
  const filtered = notifications.filter(n => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      n.title?.toLowerCase().includes(q)   ||
      n.message?.toLowerCase().includes(q);
    const matchType = filterType === "All" || n.type === filterType;
    return matchSearch && matchType;
  });

  // ── Stats ──────────────────────────────────────────────────────
  const todayCount = notifications.filter(n => {
    const d = new Date(n.createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  }).length;

  return (
    <RoleDashboardLayout title="Notifications" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Notifications</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform alerts and broadcast messages</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => fetchNotifications(page)}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm cursor-pointer">
                <MailOpen size={14} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={handleDeleteAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 rounded-lg hover:bg-red-100 text-sm cursor-pointer">
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total",       value: totalCount,   icon: Bell,        bg: "bg-violet-100 dark:bg-violet-900/20", color: "text-violet-600" },
            { label: "Unread",      value: unreadCount,  icon: Mail,        bg: "bg-blue-100 dark:bg-blue-900/20",    color: "text-blue-600" },
            { label: "Today",       value: todayCount,   icon: Clock,       bg: "bg-emerald-100 dark:bg-emerald-900/20",color: "text-emerald-600" },
            { label: "This Page",   value: filtered.length, icon: Filter,   bg: "bg-amber-100 dark:bg-amber-900/20",  color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={16} className={s.color} />
              </div>
              {loading
                ? <div className="h-6 bg-[var(--surface2)] rounded animate-pulse w-12 mb-1" />
                : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value.toLocaleString()}</p>}
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Broadcast Panel ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
              <Send size={15} className="text-violet-600" />
            </div>
            <p className="font-semibold text-[var(--text)]">Send Platform Notification</p>
            {sendSuccess && (
              <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle size={13} /> Sent successfully!
              </span>
            )}
          </div>
          <form onSubmit={handleBroadcast} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Audience */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Target Audience</label>
                <div className="relative">
                  <select value={broadcast.audience} onChange={e => setB("audience", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    {AUDIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>
              {/* Channel */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Channel</label>
                <div className="relative">
                  <select value={broadcast.channel} onChange={e => setB("channel", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    {CHANNEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>
              {/* Type */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Type</label>
                <div className="relative">
                  <select value={broadcast.type} onChange={e => setB("type", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>
            </div>
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Title <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="Notification title..."
                value={broadcast.title} onChange={e => setB("title", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
            </div>
            {/* Message */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Message <span className="text-red-500">*</span></label>
              <textarea required rows={2} placeholder="Write your message..."
                value={broadcast.message} onChange={e => setB("message", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={sending}
                className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm font-medium cursor-pointer">
                {sending
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send size={14} />}
                {sending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Notification List ── */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          {/* List header + filters */}
          <div className="px-5 py-4 border-b border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[var(--text)]">Notification Feed</p>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)]">{totalCount.toLocaleString()} total</p>
            </div>

            {/* Search + type filter + read filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                <input type="text" placeholder="Search notifications..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["All", "unread"].map(f => (
                  <button key={f} onClick={() => setFilterRead(f === "unread" ? "Unread" : "All")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize whitespace-nowrap ${
                      (f === "unread" ? filterRead === "Unread" : filterRead === "All")
                        ? "bg-violet-600 text-white"
                        : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
                    }`}>{f === "unread" ? "Unread" : "All"}</button>
                ))}
                <div className="relative">
                  <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] focus:outline-none appearance-none cursor-pointer">
                    <option value="All">All Types</option>
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Notification items */}
          <div className="divide-y divide-[var(--border)]">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4 animate-pulse">
                  <div className="w-9 h-9 rounded-lg bg-[var(--surface2)] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-[var(--surface2)] rounded w-48" />
                    <div className="h-3 bg-[var(--surface2)] rounded w-72" />
                  </div>
                  <div className="h-3 bg-[var(--surface2)] rounded w-16" />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Bell size={36} className="text-[var(--muted2)] mx-auto mb-2" />
                <p className="text-sm text-[var(--muted)]">No notifications found</p>
              </div>
            ) : filtered.map(n => {
              const tc = typeConfig[n.type] || typeConfig.system;
              const Icon = tc.icon;
              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkRead(n)}
                  className={`flex items-start gap-3 sm:gap-4 px-5 py-4 hover:bg-[var(--surface2)] transition-colors cursor-pointer ${
                    !n.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                  }`}>
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                    <Icon size={16} className={tc.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm text-[var(--text)] ${!n.read ? "font-semibold" : "font-medium"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0" />
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 bg-[var(--surface2)] rounded-full text-[var(--muted)] capitalize">
                        {n.type}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[var(--surface2)] rounded-full text-[var(--muted)] capitalize">
                        {n.audience}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{n.message}</p>
                    <p className="text-[10px] text-[var(--muted2)] mt-1">{fmtDate(n.createdAt)}</p>
                  </div>

                  {/* Time + delete */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <span className="text-[11px] text-[var(--muted2)] whitespace-nowrap hidden sm:block">
                      {fmtTime(n.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDelete(n)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                      <Trash2 size={13} className="text-[var(--muted2)] hover:text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">
                Page {page} of {totalPages} · {totalCount.toLocaleString()} notifications
              </p>
              <div className="flex gap-2">
                <button onClick={() => fetchNotifications(page - 1)} disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] cursor-pointer">
                  ← Prev
                </button>
                <button onClick={() => fetchNotifications(page + 1)} disabled={page >= totalPages}
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
