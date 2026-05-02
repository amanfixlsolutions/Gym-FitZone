"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { reviewAPI, gymAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Star, Flag, CheckCircle, Trash2, ThumbsUp, ThumbsDown,
  Search, RefreshCw, X, ChevronDown, Eye, Filter,
} from "lucide-react";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusCls = {
  pending:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  flagged:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  rejected: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// ── Star renderer ──────────────────────────────────────────────────
function Stars({ count, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          className={i <= count ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"} />
      ))}
    </div>
  );
}

// ── Flag/Reject reason modal ───────────────────────────────────────
function ReasonModal({ title, placeholder, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--text)]">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
            <X size={16} className="text-[var(--muted)]" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <textarea rows={3} placeholder={placeholder || "Reason (optional)..."}
            value={reason} onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2 border border-[var(--border)] text-[var(--text)] text-sm font-medium rounded-xl hover:bg-[var(--surface2)] cursor-pointer">
              Cancel
            </button>
            <button onClick={() => onConfirm(reason)}
              className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 cursor-pointer">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Review Detail Modal ────────────────────────────────────────────
function ReviewModal({ review, onClose, onApprove, onFlag, onReject, onDelete }) {
  if (!review) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text)]">Review Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
            <X size={18} className="text-[var(--muted)]" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Reviewer header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {review.reviewerName?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[var(--text)]">{review.reviewerName}</p>
              {review.reviewerEmail && <p className="text-xs text-[var(--muted)]">{review.reviewerEmail}</p>}
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusCls[review.status]}`}>
              {review.status}
            </span>
          </div>

          {/* Gym + Rating */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted)] mb-0.5">Gym</p>
              <p className="font-semibold text-blue-600">{review.gym?.name || "—"}</p>
              {review.gym?.city && <p className="text-xs text-[var(--muted)]">{review.gym.city}</p>}
            </div>
            <div className="text-right">
              <Stars count={review.rating} size={16} />
              <p className="text-sm font-bold text-[var(--text)] mt-0.5">{review.rating} / 5</p>
            </div>
          </div>

          {/* Title */}
          {review.title && (
            <p className="font-semibold text-[var(--text)]">"{review.title}"</p>
          )}

          {/* Content */}
          <div className="bg-[var(--surface2)] rounded-xl p-4">
            <p className="text-sm text-[var(--text)] leading-relaxed">{review.content}</p>
          </div>

          {/* Helpful count */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <ThumbsUp size={13} /> {review.helpful || 0} people found this helpful
          </div>

          {/* Flag reason */}
          {review.flagReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-600 mb-1">Flag / Reject Reason</p>
              <p className="text-sm text-red-700 dark:text-red-400">{review.flagReason}</p>
            </div>
          )}

          {/* Moderation info */}
          {review.moderatedAt && (
            <p className="text-xs text-[var(--muted)]">Moderated: {fmtDate(review.moderatedAt)}</p>
          )}
          <p className="text-xs text-[var(--muted)]">Submitted: {fmtDate(review.createdAt)}</p>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {review.status !== "approved" && (
              <button onClick={() => { onApprove(review); onClose(); }}
                className="py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer">
                <CheckCircle size={14} /> Approve
              </button>
            )}
            {review.status !== "flagged" && (
              <button onClick={() => { onFlag(review); onClose(); }}
                className="py-2.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-sm font-semibold rounded-xl hover:bg-amber-200 flex items-center justify-center gap-1.5 cursor-pointer">
                <Flag size={14} /> Flag
              </button>
            )}
            {review.status !== "rejected" && (
              <button onClick={() => { onReject(review); onClose(); }}
                className="py-2.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-200 flex items-center justify-center gap-1.5 cursor-pointer">
                <ThumbsDown size={14} /> Reject
              </button>
            )}
            <button onClick={() => { onDelete(review); onClose(); }}
              className="py-2.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-200 flex items-center justify-center gap-1.5 cursor-pointer">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function Page() {
  const [reviews,      setReviews]      = useState([]);
  const [gyms,         setGyms]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterGym,    setFilterGym]    = useState("All");
  const [filterRating, setFilterRating] = useState("All");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);

  // Modals
  const [viewReview,  setViewReview]  = useState(null);
  const [reasonModal, setReasonModal] = useState(null); // { review, action }

  const LIMIT = 20;

  // ── Fetch reviews ──────────────────────────────────────────────
  const fetchReviews = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page: pg };
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterGym    !== "All") params.gymId  = filterGym;
      const res = await reviewAPI.getAll(params);
      setReviews(res.data || []);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.pages || 1);
      setPage(pg);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterGym]);

  // ── Fetch gyms for filter dropdown ────────────────────────────
  const fetchGyms = useCallback(async () => {
    try {
      const res = await gymAPI.getAll({ status: "active", limit: 100 });
      setGyms(res.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchGyms(); fetchReviews(1); }, [fetchGyms]);

  // ── Re-fetch when filters change ───────────────────────────────
  useEffect(() => { fetchReviews(1); }, [filterStatus, filterGym]);

  // ── Actions ────────────────────────────────────────────────────
  const handleApprove = async (review) => {
    try {
      await reviewAPI.approve(review._id);
      showSuccess("Review approved");
      fetchReviews(page);
    } catch (err) { showError(err.message || "Failed"); }
  };

  const handleFlag   = (review) => setReasonModal({ review, action: "flag" });
  const handleReject = (review) => setReasonModal({ review, action: "reject" });

  const handleReasonConfirm = async (reason) => {
    if (!reasonModal) return;
    try {
      if (reasonModal.action === "flag") {
        await reviewAPI.flag(reasonModal.review._id, reason);
        showSuccess("Review flagged");
      } else {
        await reviewAPI.reject(reasonModal.review._id, reason);
        showSuccess("Review rejected");
      }
      setReasonModal(null);
      fetchReviews(page);
    } catch (err) { showError(err.message || "Failed"); }
  };

  const handleDelete = async (review) => {
    const confirmed = await confirmToast(`Delete review by "${review.reviewerName}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await reviewAPI.delete(review._id);
      showSuccess("Review deleted");
      fetchReviews(page);
    } catch (err) { showError(err.message || "Failed"); }
  };

  // ── Client-side search + rating filter ────────────────────────
  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.reviewerName?.toLowerCase().includes(q) ||
      r.content?.toLowerCase().includes(q)      ||
      r.title?.toLowerCase().includes(q)        ||
      r.gym?.name?.toLowerCase().includes(q);
    const matchRating = filterRating === "All" || r.rating === Number(filterRating);
    return matchSearch && matchRating;
  });

  // ── Stats ──────────────────────────────────────────────────────
  const pendingCount  = reviews.filter(r => r.status === "pending").length;
  const approvedCount = reviews.filter(r => r.status === "approved").length;
  const flaggedCount  = reviews.filter(r => r.status === "flagged").length;
  const avgRating     = reviews.filter(r => r.rating > 0).length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <RoleDashboardLayout title="Reviews" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Reviews & Ratings</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Moderate member reviews across all gyms — {totalCount.toLocaleString()} total
            </p>
          </div>
          <button onClick={() => fetchReviews(page)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm cursor-pointer w-fit">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Reviews",  value: totalCount.toLocaleString() },
            { label: "Approved",       value: approvedCount.toLocaleString() },
            { label: "Pending",        value: pendingCount.toLocaleString() },
            { label: "Avg Rating",     value: avgRating ? `${avgRating} ★` : "—" },
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
            <input type="text" placeholder="Search by reviewer, gym, content..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>

          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {["All", "pending", "approved", "flagged", "rejected"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize whitespace-nowrap ${
                  filterStatus === f
                    ? "bg-violet-600 text-white"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
                }`}>{f}</button>
            ))}
          </div>

          {/* Rating filter */}
          <div className="relative">
            <select value={filterRating} onChange={e => setFilterRating(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] focus:outline-none appearance-none cursor-pointer">
              <option value="All">All Ratings</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
          </div>

          {/* Gym filter */}
          {gyms.length > 0 && (
            <div className="relative">
              <select value={filterGym} onChange={e => setFilterGym(e.target.value)}
                className="pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] focus:outline-none appearance-none cursor-pointer max-w-[160px]">
                <option value="All">All Gyms</option>
                {gyms.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
            </div>
          )}
        </div>

        {/* Review Cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface2)] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--surface2)] rounded w-48" />
                    <div className="h-3 bg-[var(--surface2)] rounded w-32" />
                    <div className="h-3 bg-[var(--surface2)] rounded w-full" />
                    <div className="h-3 bg-[var(--surface2)] rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
            <Star size={40} className="text-[var(--muted2)] mx-auto mb-3" />
            <p className="font-semibold text-[var(--text)]">No reviews found</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {search ? "Try a different search term" : "No reviews match the selected filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r._id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">

                  {/* Left: reviewer info + content */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {r.reviewerName?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Name + gym */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-[var(--text)] text-sm">{r.reviewerName}</p>
                        <span className="text-xs text-[var(--muted)]">→</span>
                        <p className="text-sm text-blue-600 font-medium">{r.gym?.name || "—"}</p>
                        {r.gym?.city && <span className="text-xs text-[var(--muted)]">· {r.gym.city}</span>}
                      </div>

                      {/* Stars + date */}
                      <div className="flex items-center gap-2 mb-2">
                        <Stars count={r.rating} />
                        <span className="text-xs text-[var(--muted)]">{fmtDate(r.createdAt)}</span>
                      </div>

                      {/* Title */}
                      {r.title && (
                        <p className="text-sm font-semibold text-[var(--text)] mb-1">"{r.title}"</p>
                      )}

                      {/* Content */}
                      <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-3">{r.content}</p>

                      {/* Helpful + flag reason */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <ThumbsUp size={11} /> {r.helpful || 0} helpful
                        </span>
                        {r.flagReason && (
                          <span className="text-xs text-red-500 truncate max-w-[200px]">
                            ⚑ {r.flagReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${statusCls[r.status]}`}>
                      {r.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewReview(r)}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer" title="View details">
                        <Eye size={14} className="text-blue-600" />
                      </button>
                      {r.status !== "approved" && (
                        <button onClick={() => handleApprove(r)}
                          className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg cursor-pointer" title="Approve">
                          <CheckCircle size={14} className="text-emerald-500" />
                        </button>
                      )}
                      {r.status !== "flagged" && (
                        <button onClick={() => handleFlag(r)}
                          className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg cursor-pointer" title="Flag">
                          <Flag size={14} className="text-amber-500" />
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button onClick={() => handleReject(r)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer" title="Reject">
                          <ThumbsDown size={14} className="text-gray-500" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(r)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer" title="Delete">
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--muted)]">
              Page {page} of {totalPages} · {totalCount.toLocaleString()} reviews
            </p>
            <div className="flex gap-2">
              <button onClick={() => fetchReviews(page - 1)} disabled={page <= 1}
                className="px-3 py-1.5 text-xs font-medium bg-[var(--surface)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--surface2)] cursor-pointer">
                ← Prev
              </button>
              <button onClick={() => fetchReviews(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs font-medium bg-[var(--surface)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--surface2)] cursor-pointer">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Review Detail Modal ── */}
      {viewReview && (
        <ReviewModal
          review={viewReview}
          onClose={() => setViewReview(null)}
          onApprove={handleApprove}
          onFlag={handleFlag}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}

      {/* ── Flag / Reject Reason Modal ── */}
      {reasonModal && (
        <ReasonModal
          title={reasonModal.action === "flag" ? "Flag Review" : "Reject Review"}
          placeholder={reasonModal.action === "flag" ? "Why is this review being flagged?" : "Why is this review being rejected?"}
          onConfirm={handleReasonConfirm}
          onClose={() => setReasonModal(null)}
        />
      )}
    </RoleDashboardLayout>
  );
}
