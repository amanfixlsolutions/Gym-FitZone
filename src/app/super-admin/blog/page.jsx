"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { blogAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Plus, Edit2, Trash2, Eye, X, Check, BookOpen,
  RefreshCw, Search, ChevronDown, Globe, FileText,
  Calendar, Tag, User, TrendingUp,
} from "lucide-react";

const CATEGORIES = ["Fitness", "Nutrition", "Wellness", "News", "Tips", "Other"];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusCls = {
  published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  draft:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const catCls = {
  Fitness:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Nutrition: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Wellness:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  News:      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Tips:      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Other:     "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

const catGrad = {
  Fitness:   "from-emerald-600 to-teal-700",
  Nutrition: "from-amber-500 to-orange-600",
  Wellness:  "from-blue-600 to-cyan-700",
  News:      "from-gray-600 to-gray-700",
  Tips:      "from-purple-600 to-violet-700",
  Other:     "from-pink-600 to-rose-700",
};

const EMPTY_FORM = {
  title: "", category: "Fitness", content: "", excerpt: "",
  tags: "", status: "draft", seoTitle: "", seoDescription: "",
};

// ── Blog Form Modal ────────────────────────────────────────────────
function BlogFormModal({ editBlog, onClose, onSaved }) {
  const [form, setForm] = useState(
    editBlog ? {
      title:          editBlog.title          || "",
      category:       editBlog.category       || "Fitness",
      content:        editBlog.content        || "",
      excerpt:        editBlog.excerpt        || "",
      tags:           editBlog.tags?.join(", ") || "",
      status:         editBlog.status         || "draft",
      seoTitle:       editBlog.seoTitle       || "",
      seoDescription: editBlog.seoDescription || "",
    } : EMPTY_FORM
  );
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [tab,     setTab]     = useState("content"); // content | seo

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const payload = {
        title:          form.title,
        category:       form.category,
        content:        form.content,
        excerpt:        form.excerpt,
        tags:           form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        status:         form.status,
        seoTitle:       form.seoTitle,
        seoDescription: form.seoDescription,
      };
      if (editBlog) {
        await blogAPI.update(editBlog._id, payload);
        showSuccess("Post updated!");
      } else {
        await blogAPI.create(payload);
        showSuccess("Post created!");
      }
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 1000);
    } catch (err) {
      showError(err.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{editBlog ? "Edit Post" : "New Blog Post"}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">{editBlog ? "Update post details" : "Create a new fitness article"}</p>
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
            <p className="text-sm text-[var(--muted)] mt-1">"{form.title}" has been {editBlog ? "updated" : "saved"}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 bg-[var(--surface2)] p-1 rounded-xl w-fit">
              {[
                { id: "content", label: "Content" },
                { id: "seo",     label: "SEO & Tags" },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tab === t.id
                      ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}>{t.label}</button>
              ))}
            </div>

            {tab === "content" && (
              <>
                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Post Title <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Top 10 Gyms in Mumbai for 2025"
                    value={form.title} onChange={e => set("title", e.target.value)} className={inputCls} />
                </div>

                {/* Category + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Category <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select value={form.category} onChange={e => set("category", e.target.value)}
                        className={`${inputCls} appearance-none`}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Status</label>
                    <div className="flex gap-2">
                      {["draft", "published"].map(s => (
                        <button key={s} type="button" onClick={() => set("status", s)}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all cursor-pointer capitalize ${
                            form.status === s
                              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                              : "border-[var(--border)] text-[var(--muted)] hover:border-violet-300"
                          }`}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Excerpt <span className="text-[var(--muted2)]">(short summary)</span></label>
                  <input type="text" placeholder="Brief description shown in listings..."
                    value={form.excerpt} onChange={e => set("excerpt", e.target.value)} className={inputCls} />
                </div>

                {/* Content */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Content <span className="text-red-500">*</span></label>
                  <textarea required rows={10} placeholder="Write your full article content here..."
                    value={form.content} onChange={e => set("content", e.target.value)}
                    className={`${inputCls} resize-none`} />
                  <p className="text-[10px] text-[var(--muted2)] mt-1">{form.content.length} characters</p>
                </div>
              </>
            )}

            {tab === "seo" && (
              <>
                {/* Tags */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Tags <span className="text-[var(--muted2)]">(comma separated)</span></label>
                  <input type="text" placeholder="fitness, gym, health, tips"
                    value={form.tags} onChange={e => set("tags", e.target.value)} className={inputCls} />
                  {form.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* SEO Title */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">SEO Title</label>
                  <input type="text" placeholder="SEO optimized title (60 chars max)"
                    value={form.seoTitle} onChange={e => set("seoTitle", e.target.value)} className={inputCls} />
                  <p className={`text-[10px] mt-1 ${form.seoTitle.length > 60 ? "text-red-500" : "text-[var(--muted2)]"}`}>
                    {form.seoTitle.length}/60 characters
                  </p>
                </div>

                {/* SEO Description */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">SEO Description</label>
                  <textarea rows={3} placeholder="Meta description for search engines (160 chars max)"
                    value={form.seoDescription} onChange={e => set("seoDescription", e.target.value)}
                    className={`${inputCls} resize-none`} />
                  <p className={`text-[10px] mt-1 ${form.seoDescription.length > 160 ? "text-red-500" : "text-[var(--muted2)]"}`}>
                    {form.seoDescription.length}/160 characters
                  </p>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm cursor-pointer">
                Cancel
              </button>
              <button type="button" disabled={saving || !form.title || !form.content}
                onClick={() => { set("status", "draft"); setTimeout(() => document.querySelector("form").requestSubmit(), 50); }}
                className="px-4 py-2.5 border border-[var(--border)] text-[var(--muted)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm disabled:opacity-40 cursor-pointer">
                Save Draft
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Plus size={15} />}
                {saving ? "Saving..." : editBlog ? "Update Post" : form.status === "published" ? "Publish" : "Create Draft"}
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
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCat,    setFilterCat]    = useState("All");
  const [showModal,    setShowModal]    = useState(false);
  const [editPost,     setEditPost]     = useState(null);
  const [viewPost,     setViewPost]     = useState(null);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);

  const LIMIT = 12;

  // ── Fetch posts ────────────────────────────────────────────────
  const fetchPosts = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page: pg };
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterCat    !== "All") params.category = filterCat;
      if (search.trim())          params.search = search.trim();
      const res = await blogAPI.getAll(params);
      setPosts(res.data || []);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.pages || 1);
      setPage(pg);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCat, search]);

  useEffect(() => { fetchPosts(1); }, [filterStatus, filterCat]);

  // ── Search debounce ────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => fetchPosts(1), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Toggle publish/draft ───────────────────────────────────────
  const handleTogglePublish = async (post) => {
    try {
      const newStatus = post.status === "published" ? "draft" : "published";
      await blogAPI.update(post._id, { status: newStatus });
      showSuccess(`Post ${newStatus === "published" ? "published" : "moved to draft"}`);
      fetchPosts(page);
    } catch (err) {
      showError(err.message || "Failed");
    }
  };

  // ── Delete post ────────────────────────────────────────────────
  const handleDelete = async (post) => {
    const confirmed = await confirmToast(`Delete "${post.title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await blogAPI.delete(post._id);
      showSuccess("Post deleted");
      fetchPosts(page);
    } catch (err) {
      showError(err.message || "Delete failed");
    }
  };

  // ── Stats ──────────────────────────────────────────────────────
  const publishedCount = posts.filter(p => p.status === "published").length;
  const draftCount     = posts.filter(p => p.status === "draft").length;
  const totalViews     = posts.reduce((s, p) => s + (p.views || 0), 0);

  return (
    <RoleDashboardLayout title="Blog / Content" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Blog & Content</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage fitness articles and SEO content</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchPosts(page)}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => { setEditPost(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm shadow-sm cursor-pointer">
              <Plus size={15} /> New Post
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Posts",  value: totalCount,                                                    icon: FileText },
            { label: "Published",    value: publishedCount,                                                icon: Globe },
            { label: "Total Views",  value: totalViews >= 1000 ? `${(totalViews/1000).toFixed(1)}K` : totalViews, icon: TrendingUp },
            { label: "Drafts",       value: draftCount,                                                    icon: BookOpen },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                {loading
                  ? <div className="h-6 bg-[var(--surface2)] rounded animate-pulse w-12" />
                  : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>}
                <s.icon size={16} className="text-[var(--muted2)]" />
              </div>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search posts by title or content..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "published", "draft"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize whitespace-nowrap ${
                  filterStatus === f
                    ? "bg-violet-600 text-white"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
                }`}>{f === "All" ? "All" : f}</button>
            ))}
            <div className="relative">
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] focus:outline-none appearance-none cursor-pointer">
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Blog Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden animate-pulse">
                <div className="h-20 bg-[var(--surface2)]" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[var(--surface2)] rounded w-16" />
                  <div className="h-4 bg-[var(--surface2)] rounded w-full" />
                  <div className="h-4 bg-[var(--surface2)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--surface2)] rounded w-24" />
                  <div className="h-8 bg-[var(--surface2)] rounded-lg mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
            <BookOpen size={40} className="text-[var(--muted2)] mx-auto mb-3" />
            <p className="font-semibold text-[var(--text)]">No posts found</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {search ? "Try a different search term" : "Create your first blog post"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {posts.map(p => {
              const grad = catGrad[p.category] || catGrad.Other;
              const cc   = catCls[p.category]  || catCls.Other;
              return (
                <div key={p._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow">

                  {/* Card header banner */}
                  <div className={`bg-gradient-to-r ${grad} h-20 flex items-center justify-center relative`}>
                    <BookOpen size={32} className="text-white/30" />
                    <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusCls[p.status]}`}>
                      {p.status}
                    </span>
                    {p.views > 0 && (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white/80 bg-black/30 px-2 py-0.5 rounded-full">
                        <Eye size={10} /> {p.views.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Category badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cc}`}>{p.category}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-[var(--text)] text-sm leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-violet-600 transition-colors"
                      onClick={() => setViewPost(p)}>
                      {p.title}
                    </h3>

                    {/* Excerpt */}
                    {p.excerpt && (
                      <p className="text-xs text-[var(--muted)] mb-2 line-clamp-2">{p.excerpt}</p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
                      <span className="flex items-center gap-1">
                        <User size={11} /> {p.authorName || "Admin"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {fmtDate(p.publishedAt || p.createdAt)}
                      </span>
                    </div>

                    {/* Tags */}
                    {p.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 bg-[var(--surface2)] text-[var(--muted)] rounded-full">#{tag}</span>
                        ))}
                        {p.tags.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 bg-[var(--surface2)] text-[var(--muted)] rounded-full">+{p.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          p.status === "published"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}>
                        {p.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => { setEditPost(p); setShowModal(true); }}
                        className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[var(--muted)] hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--muted)]">Page {page} of {totalPages} · {totalCount} posts</p>
            <div className="flex gap-2">
              <button onClick={() => fetchPosts(page - 1)} disabled={page <= 1}
                className="px-3 py-1.5 text-xs font-medium bg-[var(--surface)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--surface2)] cursor-pointer">
                ← Prev
              </button>
              <button onClick={() => fetchPosts(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs font-medium bg-[var(--surface)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--surface2)] cursor-pointer">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Post Detail Modal ── */}
      {viewPost && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--text)] line-clamp-1">{viewPost.title}</h2>
              <button onClick={() => setViewPost(null)} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Meta */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catCls[viewPost.category] || catCls.Other}`}>
                  {viewPost.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusCls[viewPost.status]}`}>
                  {viewPost.status}
                </span>
                <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                  <Eye size={11} /> {(viewPost.views || 0).toLocaleString()} views
                </span>
                <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                  <User size={11} /> {viewPost.authorName || "Admin"}
                </span>
                <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                  <Calendar size={11} /> {fmtDate(viewPost.publishedAt || viewPost.createdAt)}
                </span>
              </div>

              {/* Excerpt */}
              {viewPost.excerpt && (
                <p className="text-sm text-[var(--muted)] italic border-l-4 border-violet-400 pl-3">{viewPost.excerpt}</p>
              )}

              {/* Content */}
              <div className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap bg-[var(--surface2)] rounded-xl p-4 max-h-64 overflow-y-auto">
                {viewPost.content}
              </div>

              {/* Tags */}
              {viewPost.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {viewPost.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}

              {/* SEO */}
              {(viewPost.seoTitle || viewPost.seoDescription) && (
                <div className="bg-[var(--surface2)] rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">SEO</p>
                  {viewPost.seoTitle && <p className="text-sm font-medium text-[var(--text)]">{viewPost.seoTitle}</p>}
                  {viewPost.seoDescription && <p className="text-xs text-[var(--muted)]">{viewPost.seoDescription}</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => { handleTogglePublish(viewPost); setViewPost(null); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                    viewPost.status === "published"
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}>
                  {viewPost.status === "published" ? "Move to Draft" : "Publish Now"}
                </button>
                <button onClick={() => { setEditPost(viewPost); setViewPost(null); setShowModal(true); }}
                  className="flex-1 py-2.5 bg-[var(--surface2)] text-[var(--text)] text-sm font-semibold rounded-xl hover:bg-[var(--border)] flex items-center justify-center gap-1.5 cursor-pointer">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => { handleDelete(viewPost); setViewPost(null); }}
                  className="px-4 py-2.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-200 cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Blog Form Modal ── */}
      {showModal && (
        <BlogFormModal
          editBlog={editPost}
          onClose={() => { setShowModal(false); setEditPost(null); }}
          onSaved={() => fetchPosts(page)}
        />
      )}
    </RoleDashboardLayout>
  );
}
