"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { blogAPI } from "@/lib/api";
import {
  Search, Calendar, Eye, Tag, ArrowRight,
  BookOpen, Flame, Leaf, Heart, Newspaper, Lightbulb, MoreHorizontal,
} from "lucide-react";

// ── Category config ────────────────────────────────────────────────
const CATEGORIES = [
  { label: "All",       value: "",          icon: BookOpen,    color: "amber" },
  { label: "Fitness",   value: "Fitness",   icon: Flame,       color: "orange" },
  { label: "Nutrition", value: "Nutrition", icon: Leaf,        color: "green" },
  { label: "Wellness",  value: "Wellness",  icon: Heart,       color: "pink" },
  { label: "News",      value: "News",      icon: Newspaper,   color: "blue" },
  { label: "Tips",      value: "Tips",      icon: Lightbulb,   color: "yellow" },
  { label: "Other",     value: "Other",     icon: MoreHorizontal, color: "gray" },
];

const CAT_COLORS = {
  Fitness:   "bg-orange-100 text-orange-700",
  Nutrition: "bg-green-100 text-green-700",
  Wellness:  "bg-pink-100 text-pink-700",
  News:      "bg-blue-100 text-blue-700",
  Tips:      "bg-yellow-100 text-yellow-700",
  Other:     "bg-gray-100 text-gray-700",
};

// ── Fallback images per category ───────────────────────────────────
const FALLBACK_IMAGES = {
  Fitness:   "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  Nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  Wellness:  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  News:      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
  Tips:      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  Other:     "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
};

const getImage = (blog) =>
  blog.image || FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

const readTime = (content = "") => {
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

// ── Skeleton card ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="flex gap-2 pt-2">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Blog Card ──────────────────────────────────────────────────────
function BlogCard({ blog, featured = false }) {
  const [imgError, setImgError] = useState(false);
  const img = imgError ? FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness : getImage(blog);

  if (featured) {
    return (
      <Link href={`/blog/${blog.slug || blog._id}`}
        className="group relative rounded-3xl overflow-hidden shadow-xl block h-[420px] md:h-[480px]">
        <img src={img} alt={blog.title} onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${CAT_COLORS[blog.category] || "bg-amber-100 text-amber-700"}`}>
              {blog.category}
            </span>
            <span className="text-white/70 text-xs">{readTime(blog.content)} min read</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
            {blog.title}
          </h2>
          <p className="text-white/80 text-sm line-clamp-2 mb-4">{blog.excerpt || blog.content?.replace(/<[^>]+>/g, "").slice(0, 120) + "..."}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/60 text-xs">
              <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(blog.publishedAt || blog.createdAt)}</span>
              <span className="flex items-center gap-1"><Eye size={12} />{blog.views || 0} views</span>
            </div>
            <span className="flex items-center gap-1 text-amber-400 text-sm font-bold group-hover:gap-2 transition-all">
              Read More <ArrowRight size={14} />
            </span>
          </div>
        </div>
        {/* Featured badge */}
        <div className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
          Featured
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${blog.slug || blog._id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-amber-200 transition-all duration-300 flex flex-col">
      <div className="relative h-52 overflow-hidden">
        <img src={img} alt={blog.title} onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${CAT_COLORS[blog.category] || "bg-amber-100 text-amber-700"}`}>
          {blog.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors leading-snug">
          {blog.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 flex-1 leading-relaxed">
          {blog.excerpt || blog.content?.replace(/<[^>]+>/g, "").slice(0, 120) + "..."}
        </p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(blog.publishedAt || blog.createdAt)}</span>
            <span className="flex items-center gap-1"><Eye size={11} />{blog.views || 0}</span>
            <span className="flex items-center gap-1"><BookOpen size={11} />{readTime(blog.content)}m</span>
          </div>
          <span className="text-amber-500 text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
            Read <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function BlogPage() {
  const [blogs,    setBlogs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 9;

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = { status: "published", limit: LIMIT, page };
        if (search)   params.search   = search;
        if (category) params.category = category;
        const res = await blogAPI.getAll(params);
        setBlogs(res.data || []);
        setTotal(res.pagination?.total || 0);
      } catch {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [search, category, page]);

  const featured  = blogs[0];
  const rest      = blogs.slice(1);
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-gray-50 pt-[64px]">

      {/* ── HERO ── */}
      <section className="relative h-[420px] md:h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80"
          alt="Blog Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="inline-block bg-amber-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 shadow-lg">
            FitZone Blog
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Fitness <span className="text-amber-400">Tips &</span><br />
            Expert Advice
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-8">
            Discover workouts, nutrition guides, wellness tips and the latest fitness news from our expert trainers.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/95 backdrop-blur text-gray-800 placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      <section className="sticky top-[64px] z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const active = category === cat.value;
              return (
                <button key={cat.value} onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    active
                      ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                      : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600"
                  }`}>
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={56} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No articles found</h3>
            <p className="text-gray-400 text-sm">
              {search ? `No results for "${search}"` : "No published articles yet. Check back soon!"}
            </p>
            {(search || category) && (
              <button onClick={() => { setSearch(""); setCategory(""); }}
                className="mt-4 text-amber-500 font-semibold text-sm hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && page === 1 && !search && !category && (
              <div className="mb-10">
                <BlogCard blog={featured} featured />
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(page === 1 && !search && !category ? rest : blogs).map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      p === page
                        ? "bg-amber-500 text-white shadow-md"
                        : "border border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-300"
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── NEWSLETTER CTA ── */}
      <section className="relative overflow-hidden py-20 mt-8">
        <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80"
          alt="Newsletter" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/90 to-orange-600/90" />
        <div className="relative z-10 max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Stay Fit, Stay Informed</h2>
          <p className="text-white/90 mb-8 text-base">
            Get the latest fitness tips, workout plans and nutrition advice delivered to your inbox.
          </p>
          <Link href="/membership"
            className="inline-flex items-center gap-2 bg-white text-amber-600 font-black px-8 py-3.5 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm">
            Join FitZone Today <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
