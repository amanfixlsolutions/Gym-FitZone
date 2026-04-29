"use client";
import { useState } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { Plus, Edit2, Trash2, Eye, X, Check, BookOpen } from "lucide-react";

const CATEGORIES = ["Gym Guide", "Tips", "Fitness", "Nutrition", "Motivation", "News"];

const INITIAL = [
  { id: "B001", title: "Top 10 Gyms in Mumbai for 2025",          category: "Gym Guide", author: "Admin",        views: 12400, date: "Jan 25, 2025", status: "Published", tags: "gyms, mumbai, 2025" },
  { id: "B002", title: "How to Choose the Right Membership Plan",  category: "Tips",      author: "Admin",        views: 8900,  date: "Jan 20, 2025", status: "Published", tags: "membership, plans" },
  { id: "B003", title: "Benefits of Morning Yoga for Beginners",   category: "Fitness",   author: "Meera Nair",   views: 6200,  date: "Jan 15, 2025", status: "Published", tags: "yoga, beginners" },
  { id: "B004", title: "HIIT vs Steady-State Cardio: Which Wins?", category: "Fitness",   author: "Arjun Kapoor", views: 4800,  date: "Jan 10, 2025", status: "Published", tags: "hiit, cardio" },
  { id: "B005", title: "Nutrition Guide for Gym Beginners",        category: "Nutrition", author: "Admin",        views: 0,     date: "—",            status: "Draft",     tags: "nutrition, diet" },
];

const statusCls = {
  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Draft:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const catCls = (cat) => {
  const map = {
    "Gym Guide":  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Tips":       "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "Fitness":    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Nutrition":  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Motivation": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    "News":       "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  return map[cat] || "bg-gray-100 text-gray-600";
};

const EMPTY = { title: "", category: "Fitness", author: "Admin", content: "", tags: "", status: "Draft" };

export default function Page() {
  const [posts, setPosts] = useState(INITIAL);
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setEditPost(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (post) => {
    setEditPost(post);
    setForm({ title: post.title, category: post.category, author: post.author, content: "", tags: post.tags, status: post.status });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    if (editPost) {
      setPosts(p => p.map(post => post.id === editPost.id ? { ...post, title: form.title, category: form.category, author: form.author, tags: form.tags, status: form.status, date: form.status === "Published" ? today : post.date } : post));
    } else {
      setPosts(p => [...p, { id: `B00${p.length + 1}`, title: form.title, category: form.category, author: form.author, views: 0, date: form.status === "Published" ? today : "—", status: form.status, tags: form.tags }]);
    }
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY); }, 1200);
  };

  const deletePost = (id) => setPosts(p => p.filter(post => post.id !== id));
  const togglePublish = (id) => setPosts(p => p.map(post => post.id === id ? { ...post, status: post.status === "Published" ? "Draft" : "Published" } : post));

  return (
    <RoleDashboardLayout title="Blog / Content" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Blog & Content</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage fitness articles and SEO content</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm w-fit shadow-sm">
            <Plus size={15} /> New Post
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Posts",  value: posts.length },
            { label: "Published",    value: posts.filter(p => p.status === "Published").length },
            { label: "Total Views",  value: `${(posts.reduce((s, p) => s + p.views, 0) / 1000).toFixed(1)}K` },
            { label: "Drafts",       value: posts.filter(p => p.status === "Draft").length },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Blog cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map(p => (
            <div key={p.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {/* Card header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-700 h-20 flex items-center justify-center relative">
                <BookOpen size={32} className="text-white/30" />
                <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${statusCls[p.status]}`}>{p.status}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catCls(p.category)}`}>{p.category}</span>
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm leading-tight mb-2 line-clamp-2">{p.title}</h3>
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-3">
                  <span>By {p.author}</span>
                  <span>{p.date}</span>
                </div>
                {p.views > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[var(--muted)] mb-3">
                    <Eye size={12} /> {p.views.toLocaleString()} views
                  </div>
                )}
                {p.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.tags.split(", ").map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-[var(--surface2)] text-[var(--muted)] rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => togglePublish(p.id)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${p.status === "Published" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                    {p.status === "Published" ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => openEdit(p)} className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[var(--muted)] hover:text-blue-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deletePost(p.id)} className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--muted)] hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CREATE / EDIT POST MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{editPost ? "Edit Post" : "New Blog Post"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{editPost ? "Update post details" : "Create a new fitness article"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--surface2)] rounded-lg"><X size={18} className="text-[var(--muted)]" /></button>
            </div>
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4"><Check size={32} className="text-emerald-600" /></div>
                <p className="text-lg font-bold text-[var(--text)]">{editPost ? "Post Updated!" : "Post Created!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">"{form.title}" has been {editPost ? "updated" : "created"}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Post Title <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Top 10 Gyms in Mumbai" value={form.title} onChange={e => set("title", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Category <span className="text-red-500">*</span></label>
                    <select required value={form.category} onChange={e => set("category", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Author</label>
                    <input type="text" placeholder="Admin" value={form.author} onChange={e => set("author", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Content / Summary</label>
                  <textarea rows={4} placeholder="Write your article content or summary..." value={form.content} onChange={e => set("content", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">SEO Tags (comma separated)</label>
                  <input type="text" placeholder="gyms, fitness, mumbai" value={form.tags} onChange={e => set("tags", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Publish Status</label>
                  <div className="flex gap-3">
                    {["Draft", "Published"].map(s => (
                      <button key={s} type="button" onClick={() => set("status", s)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.status === s ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400" : "border-[var(--border)] text-[var(--muted)] hover:border-violet-300"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editPost ? "Update Post" : "Create Post"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}
