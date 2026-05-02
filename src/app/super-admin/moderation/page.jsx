"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { reviewAPI, blogAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Flag, CheckCircle, XCircle, AlertTriangle, Eye, Search,
  RefreshCw, Star, Trash2, BookOpen, MessageSquare,
  ThumbsUp, ThumbsDown, ChevronDown, X, Check, Edit2,
  Plus, Calendar, Tag,
} from "lucide-react";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const reviewStatusCls = {
  pending:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  flagged:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  rejected: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const blogStatusCls = {
  draft:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

// ── Flag Reason Modal ──────────────────────────────────────────────
function FlagReasonModal({ title, onConfirm, onClose }) {
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
          <textarea rows={3} placeholder="Reason (optional)..." value={reason} onChange={e => setReason(e.target.value)}
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
function ReviewDetailModal({ review, onClose, onApprove, onFlag, onReject, onDelete }) {
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
          {/* Reviewer */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {review.reviewerName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[var(--text)]">{review.reviewerName}</p>
              <p className="text-xs text-[var(--muted)]">{review.reviewerEmail || "No email"}</p>
            </div>
            <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${reviewStatusCls[review.status]}`}>
              {review.status}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-[var(--border)]"} />
            ))}
            <span className="text-sm font-bold text-[var(--text)] ml-1">{review.rating}/5</span>
          </div>

          {/* Gym */}
          <div className="text-sm text-[var(--muted)]">
            <span className="font-medium text-[var(--text)]">Gym:</span> {review.gym?.name || "—"} {review.gym?.city ? `· ${review.gym.city}` : ""}
          </div>

          {/* Title + Content */}
          {review.title && <p className="font-semibold text-[var(--text)]">{review.title}</p>}
          <p className="text-sm text-[var(--muted)] leading-relaxed bg-[var(--surface2)] rounded-xl p-3">{review.content}</p>

          {/* Flag reason */}
          {review.flagReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-600 mb-1">Flag Reason</p>
              <p className="text-sm text-red-700 dark:text-red-400">{review.flagReason}</p>
            </div>
          )}

          {/* Meta */}
          <p className="text-xs text-[var(--muted)]">Submitted: {fmtTime(review.createdAt)}</p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {review.status !== "approved" && (
              <button onClick={() => { onApprove(review); onClose(); }}
                className="flex-1 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer">
                <CheckCircle size={14} /> Approve
              </button>
            )}
            {review.status !== "flagged" && (
              <button onClick={() => { onFlag(review); onClose(); }}
                className="flex-1 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-sm font-semibold rounded-xl hover:bg-amber-200 flex items-center justify-center gap-1.5 cursor-pointer">
                <Flag size={14} /> Flag
              </button>
            )}
            {review.status !== "rejected" && (
              <button onClick={() => { onReject(review); onClose(); }}
                className="flex-1 py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-200 flex items-center justify-center gap-1.5 cursor-pointer">
                <XCircle size={14} /> Reject
              </button>
            )}
            <button onClick={() => { onDelete(review); onClose(); }}
              className="px-3 py-2 border border-[var(--border)] text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Blog Form Modal ────────────────────────────────────────────────
function BlogFormModal({ editBlog, onClose, onSaved }) {
  const CATEGORIES = ["Fitness", "Nutrition", "Wellness", "News", "Tips", "Other"];
  const [form, setForm] = useState(
    editBlog ? {
      title:          editBlog.title       || "",
      content:        editBlog.content     || "",
      excerpt:        editBlog.excerpt     || "",
      category:       editBlog.category   || "Fitness",
      status:         editBlog.status     || "draft",
      tags:           editBlog.tags?.join(", ") || "",
      seoTitle:       editBlog.seoTitle   || "",
      seoDescription: editBlog.seoDescription || "",
    } : { title: "", content: "", excerpt: "", category: "Fitness", status: "draft", tags: "", seoTitle: "", seoDescription: "" }
  );
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };
      if (editBlog) {
        await blogAPI.update(editBlog._id, payload);
        showSuccess("Blog updated!");
      } else {
        await blogAPI.create(payload);
        showSuccess("Blog created!");
      }
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 1000);
    } catch (err) {
      showError(err.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{editBlog ? "Edit Blog Post" : "New Blog Post"}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">{editBlog ? "Update post details" : "Write a new article"}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
            <X size={18} className="text-[var(--muted)]" />
          </button>
        </div>
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-[var(--text)]">{editBlog ? "Post Updated!" : "Post Created!"}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Title <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="Blog post title..." value={form.title} onChange={e => set("title", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Category</label>
                <div className="relative">
                  <select value={form.category} onChange={e => set("category", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Status</label>
                <div className="relative">
                  <select value={form.status} onChange={e => set("status", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Excerpt</label>
              <input type="text" placeholder="Short summary..." value={form.excerpt} onChange={e => set("excerpt", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Content <span className="text-red-500">*</span></label>
              <textarea required rows={8} placeholder="Write your blog content here..." value={form.content} onChange={e => set("content", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Tags <span className="text-[var(--muted2)]">(comma separated)</span></label>
              <input type="text" placeholder="fitness, health, tips" value={form.tags} onChange={e => set("tags", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] text-sm cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 text-sm flex items-center justify-center gap-2 cursor-pointer">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                {saving ? "Saving..." : editBlog ? "Update Post" : "Publish Post"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function Page() {
  const [activeTab,    setActiveTab]    = useState("reviews");
  const [reviews,      setReviews]      = useState([]);
  const [blogs,        setBlogs]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modals
  const [viewReview,   setViewReview]   = useState(null);
  const [flagTarget,   setFlagTarget]   = useState(null);  // { review, action: "flag"|"reject" }
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editBlog,     setEditBlog]     = useState(null);

  // ── Fetch data ─────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    try {
      const res = await reviewAPI.getAll({ limit: 100 });
      setReviews(res.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await blogAPI.getAll({ limit: 100 });
      setBlogs(res.data || []);
    } catch { /* silent */ }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchReviews(), fetchBlogs()]);
    setLoading(false);
  }, [fetchReviews, fetchBlogs]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Review actions ─────────────────────────────────────────────
  const handleApprove = async (review) => {
    try {
      await reviewAPI.approve(review._id);
      showSuccess("Review approved");
      fetchReviews();
    } catch (err) { showError(err.message || "Failed"); }
  };

  const handleFlag = (review) => setFlagTarget({ review, action: "flag" });
  const handleReject = (review) => setFlagTarget({ review, action: "reject" });

  const handleFlagConfirm = async (reason) => {
    if (!flagTarget) return;
    try {
      if (flagTarget.action === "flag") {
        await reviewAPI.flag(flagTarget.review._id, reason);
        showSuccess("Review flagged");
      } else {
        await reviewAPI.reject(flagTarget.review._id, reason);
        showSuccess("Review rejected");
      }
      setFlagTarget(null);
      fetchReviews();
    } catch (err) { showError(err.message || "Failed"); }
  };

  const handleDeleteReview = async (review) => {
    const confirmed = await confirmToast(`Delete review by "${review.reviewerName}"?`);
    if (!confirmed) return;
    try {
      await reviewAPI.delete(review._id);
      showSuccess("Review deleted");
      fetchReviews();
    } catch (err) { showError(err.message || "Failed"); }
  };

  // ── Blog actions ───────────────────────────────────────────────
  const handleDeleteBlog = async (blog) => {
    const confirmed = await confirmToast(`Delete blog post "${blog.title}"?`);
    if (!confirmed) return;
    try {
      await blogAPI.delete(blog._id);
      showSuccess("Blog post deleted");
      fetchBlogs();
    } catch (err) { showError(err.message || "Failed"); }
  };

  const handlePublishToggle = async (blog) => {
    try {
      const newStatus = blog.status === "published" ? "draft" : "published";
      await blogAPI.update(blog._id, { status: newStatus });
      showSuccess(`Blog ${newStatus === "published" ? "published" : "moved to draft"}`);
      fetchBlogs();
    } catch (err) { showError(err.message || "Failed"); }
  };

  // ── Filtered data ──────────────────────────────────────────────
  const filteredReviews = reviews.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.reviewerName?.toLowerCase().includes(q) ||
      r.content?.toLowerCase().includes(q) ||
      r.gym?.name?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || r.status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  const filteredBlogs = blogs.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      b.title?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.authorName?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || b.status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  // ── Stats ──────────────────────────────────────────────────────
  const pendingReviews  = reviews.filter(r => r.status === "pending").length;
  const flaggedReviews  = reviews.filter(r => r.status === "flagged").length;
  const approvedReviews = reviews.filter(r => r.status === "approved").length;
  const draftBlogs      = blogs.filter(b => b.status === "draft").length;

  const reviewFilters = ["All", "pending", "approved", "flagged", "rejected"];
  const blogFilters   = ["All", "draft", "published"];

  return (
    <RoleDashboardLayout title="Moderation" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Content Moderation</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage reviews, blog posts and platform content</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAll}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            {activeTab === "blogs" && (
              <button onClick={() => { setEditBlog(null); setShowBlogForm(true); }}
                className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm cursor-pointer">
                <Plus size={15} /> New Post
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pending Reviews",  value: pendingReviews,  icon: Flag,         bg: "bg-amber-100 dark:bg-amber-900/20",   color: "text-amber-600" },
            { label: "Flagged Reviews",  value: flaggedReviews,  icon: AlertTriangle, bg: "bg-red-100 dark:bg-red-900/20",      color: "text-red-600" },
            { label: "Approved Reviews", value: approvedReviews, icon: CheckCircle,  bg: "bg-emerald-100 dark:bg-emerald-900/20",color: "text-emerald-600" },
            { label: "Draft Blog Posts", value: draftBlogs,      icon: BookOpen,     bg: "bg-blue-100 dark:bg-blue-900/20",     color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={16} className={s.color} />
              </div>
              {loading
                ? <div className="h-6 bg-[var(--surface2)] rounded animate-pulse w-12 mb-1" />
                : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>}
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--surface2)] p-1 rounded-xl w-fit">
          {[
            { id: "reviews", label: `Reviews (${reviews.length})`, icon: MessageSquare },
            { id: "blogs",   label: `Blog Posts (${blogs.length})`, icon: BookOpen },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setFilterStatus("All"); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder={activeTab === "reviews" ? "Search by reviewer, content, gym..." : "Search by title, category, author..."}
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(activeTab === "reviews" ? reviewFilters : blogFilters).map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize whitespace-nowrap ${
                  filterStatus === f
                    ? "bg-violet-600 text-white"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {/* ── REVIEWS TAB ── */}
        {activeTab === "reviews" && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <p className="font-semibold text-[var(--text)]">
                Member Reviews
                <span className="ml-2 text-xs font-normal text-[var(--muted)]">({filteredReviews.length} shown)</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                  <tr>
                    {["Reviewer", "Gym", "Rating", "Content", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-20" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredReviews.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--muted)]">No reviews found</td></tr>
                  ) : filteredReviews.map(r => (
                    <tr key={r._id} className="hover:bg-[var(--surface2)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {r.reviewerName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-[var(--text)] whitespace-nowrap">{r.reviewerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{r.gym?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-[var(--text)]">{r.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)] max-w-[180px] truncate" title={r.content}>{r.content}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${reviewStatusCls[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewReview(r)}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer" title="View">
                            <Eye size={13} className="text-blue-600" />
                          </button>
                          {r.status !== "approved" && (
                            <button onClick={() => handleApprove(r)}
                              className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg cursor-pointer" title="Approve">
                              <ThumbsUp size={13} className="text-emerald-600" />
                            </button>
                          )}
                          {r.status !== "flagged" && (
                            <button onClick={() => handleFlag(r)}
                              className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg cursor-pointer" title="Flag">
                              <Flag size={13} className="text-amber-600" />
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button onClick={() => handleReject(r)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer" title="Reject">
                              <ThumbsDown size={13} className="text-gray-500" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteReview(r)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer" title="Delete">
                            <Trash2 size={13} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BLOGS TAB ── */}
        {activeTab === "blogs" && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <p className="font-semibold text-[var(--text)]">
                Blog Posts
                <span className="ml-2 text-xs font-normal text-[var(--muted)]">({filteredBlogs.length} shown)</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                  <tr>
                    {["Title", "Category", "Author", "Views", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(7)].map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-20" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredBlogs.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--muted)]">No blog posts found</td></tr>
                  ) : filteredBlogs.map(b => (
                    <tr key={b._id} className="hover:bg-[var(--surface2)] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--text)] max-w-[200px] truncate" title={b.title}>{b.title}</p>
                        {b.excerpt && <p className="text-xs text-[var(--muted)] truncate max-w-[200px]">{b.excerpt}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 bg-[var(--surface2)] rounded-full text-[var(--muted)] whitespace-nowrap">
                          {b.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{b.authorName || "—"}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{(b.views || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${blogStatusCls[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                        {fmtDate(b.publishedAt || b.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handlePublishToggle(b)}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              b.status === "published"
                                ? "hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            }`}
                            title={b.status === "published" ? "Move to Draft" : "Publish"}>
                            {b.status === "published"
                              ? <XCircle size={13} className="text-amber-600" />
                              : <CheckCircle size={13} className="text-emerald-600" />}
                          </button>
                          <button onClick={() => { setEditBlog(b); setShowBlogForm(true); }}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer" title="Edit">
                            <Edit2 size={13} className="text-blue-600" />
                          </button>
                          <button onClick={() => handleDeleteBlog(b)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer" title="Delete">
                            <Trash2 size={13} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Review Detail Modal ── */}
      {viewReview && (
        <ReviewDetailModal
          review={viewReview}
          onClose={() => setViewReview(null)}
          onApprove={handleApprove}
          onFlag={handleFlag}
          onReject={handleReject}
          onDelete={handleDeleteReview}
        />
      )}

      {/* ── Flag / Reject Reason Modal ── */}
      {flagTarget && (
        <FlagReasonModal
          title={flagTarget.action === "flag" ? "Flag Review" : "Reject Review"}
          onConfirm={handleFlagConfirm}
          onClose={() => setFlagTarget(null)}
        />
      )}

      {/* ── Blog Form Modal ── */}
      {showBlogForm && (
        <BlogFormModal
          editBlog={editBlog}
          onClose={() => { setShowBlogForm(false); setEditBlog(null); }}
          onSaved={fetchBlogs}
        />
      )}
    </RoleDashboardLayout>
  );
}
