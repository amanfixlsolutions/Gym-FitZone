"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { notificationAPI } from "@/lib/api";
import { confirmToast, showSuccess, showError } from "@/lib/toast";
import {
  CheckCircle, Trash2, Users, CreditCard, CalendarCheck,
  AlertTriangle, Bell, RefreshCw, BellOff, ChevronLeft, ChevronRight,
} from "lucide-react";

const typeConfig = {
  member: { icon: Users, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600" },
  payment: { icon: CreditCard, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600" },
  class: { icon: CalendarCheck, bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-600" },
  alert: { icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600" },
  gym: { icon: Bell, bg: "bg-indigo-100 dark:bg-indigo-900/30", color: "text-indigo-600" },
  trainer: { icon: Users, bg: "bg-teal-100 dark:bg-teal-900/30", color: "text-teal-600" },
  system: { icon: Bell, bg: "bg-gray-100 dark:bg-gray-800", color: "text-gray-600" },
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export default function Page() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const unreadCount = notifs.filter(n => !n.read).length;

  // ── Fetch notifications ────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    try {
      const res = await notificationAPI.getAll({ limit: 50 });
      setNotifs(res.data || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  // Reset to first page when notifications change (after delete, etc.)
  useEffect(() => {
    setCurrentPage(1);
  }, [notifs.length]);

  // ── Mark single as read ────────────────────────────────────────
  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifs(p => p.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { }
  };

  // ── Mark all as read ───────────────────────────────────────────
  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifs(p => p.map(n => ({ ...n, read: true })));
      showSuccess("All notifications marked as read.");
    } catch (err) {
      showError(err.message || "Failed to mark all as read.");
    }
  };

  // ── Delete single notification ─────────────────────────────────
  const deleteNotif = async (id, title) => {
    const confirmed = await confirmToast(`Delete "${title}"?`);
    if (!confirmed) return;
    setDeleting(id);
    try {
      await notificationAPI.delete(id);
      setNotifs(p => p.filter(n => n._id !== id));
      showSuccess("Notification deleted.");
    } catch (err) {
      showError(err.message || "Failed to delete notification.");
    } finally {
      setDeleting(null);
    }
  };

  // ── Delete all read notifications ──────────────────────────────
  const clearRead = async () => {
    const readNotifs = notifs.filter(n => n.read);
    if (readNotifs.length === 0) return;
    const confirmed = await confirmToast(`Delete all ${readNotifs.length} read notifications?`);
    if (!confirmed) return;
    try {
      await Promise.all(readNotifs.map(n => notificationAPI.delete(n._id)));
      setNotifs(p => p.filter(n => !n.read));
      showSuccess(`${readNotifs.length} notifications cleared.`);
    } catch (err) {
      showError("Failed to clear notifications.");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(notifs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifs = notifs.slice(startIndex, endIndex);

  return (
    <RoleDashboardLayout title="Notifications" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Notifications</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Gym activity alerts and updates
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={fetchNotifs}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            {notifs.some(n => n.read) && (
              <button
                onClick={clearRead}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-sm"
              >
                <BellOff size={14} /> Clear read
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm"
              >
                <CheckCircle size={15} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Recent Activity</p>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="w-7 h-7 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--muted)]">
              <Bell size={36} className="mb-3 opacity-30" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm mt-1">Activity updates will appear here</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[var(--border)]">
                {currentNotifs.map((n) => {
                  const tc = typeConfig[n.type] || typeConfig.system;
                  return (
                    <div
                      key={n._id}
                      className={`flex items-start gap-4 px-5 py-4 hover:bg-[var(--surface2)] transition-colors cursor-pointer ${!n.read ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}
                      onClick={() => !n.read && markRead(n._id)}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                        <tc.icon size={16} className={tc.color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm text-[var(--text)] ${!n.read ? "font-semibold" : "font-medium"}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{n.message}</p>
                      </div>

                      {/* Time + Delete */}
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <span className="text-[11px] text-[var(--muted2)] whitespace-nowrap">
                          {formatTime(n.createdAt)}
                        </span>
                        <button
                          onClick={() => deleteNotif(n._id, n.title)}
                          disabled={deleting === n._id}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          {deleting === n._id
                            ? <span className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin inline-block" />
                            : <Trash2 size={13} className="text-[var(--muted2)] hover:text-red-500" />
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {notifs.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)] bg-[var(--surface2)]">
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <span>Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>per page</span>
                    <span className="ml-4">
                      Showing {startIndex + 1} to {Math.min(endIndex, notifs.length)} of {notifs.length} notifications
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer count */}
        {notifs.length > 0 && (
          <p className="text-xs text-center text-[var(--muted2)]">
            {notifs.length} notification{notifs.length !== 1 ? "s" : ""} · {unreadCount} unread
          </p>
        )}
      </div>
    </RoleDashboardLayout>
  );
}