"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { blogAPI } from "@/lib/api";
import {
  Calendar, Eye, Clock, ArrowLeft, Tag,
  Share2, BookOpen, Flame, Leaf, Heart,
  Newspaper, Lightbulb, MoreHorizontal,
  ChevronRight, User,
} from "lucide-react";

// ── Category config ────────────────────────────────────────────────
const CAT_COLORS = {
  Fitness:   { bg: "bg-orange-100 text-orange-700",  dot: "bg-orange-500" },
  Nutrition: { bg: "bg-green-100 text-green-700",    dot: "bg-green-500" },
  Wellness:  { bg: "bg-pink-100 text-pink-700",      dot: "bg-pink-500" },
  News:      { bg: "bg-blue-100 text-blue-700",      dot: "bg-blue-500" },
  Tips:      { bg: "bg-yellow-100 text-yellow-700",  dot: "bg-yellow-500" },
  Other:     { bg: "bg-gray-100 text-gray-700",      dot: "bg-gray-500" },
};

const FALLBACK_IMAGES = {
  Fitness:   "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",
  Nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80",
  Wellness:  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
  News:      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80",
  Tips:      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
  Other:     "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";

const readTime = (content = "") => {
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

// ── Related Card ───────────────────────────────────────────────────
function RelatedCard({ blog }) {
  const [imgErr, setImgErr] = useState(false);
  const img = imgErr
    ? FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness
    : blog.image || FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness;
  const cat = CAT_COLORS[blog.category] || CAT_COLORS.Other;

  return (
    <Link href={`/blog/${blog.slug || blog._id}`}
      className="group flex gap-4 p-3 rounded-2xl hover:bg-amber-50 transition-all duration-200 border border-transparent hover:border-amber-100">
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img src={img} alt={blog.title} onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.bg}`}>{blog.category}</span>
        <h4 className="text-sm font-bold text-gray-800 mt-1 line-clamp-2 group-hover:text-amber-600 transition-colors leading-snug">
          {blog.title}
        </h4>
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Calendar size={9} /> {formatDate(blog.publishedAt || blog.createdAt)}
        </p>
      </div>
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[420px] md:h-[520px] bg-gray-200 rounded-none" />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-10 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="space-y-3 mt-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`h-4 bg-gray-200 rounded ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function BlogDetailPage() {
  const { slug }  = useParams();
  const router    = useRouter();

  const [blog,     setBlog]     = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [imgError, setImgError] = useState(false);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await blogAPI.getOne(slug);
        setBlog(res.data);
        // Fetch related posts (same category)
        const relRes = await blogAPI.getAll({
          status:   "published",
          category: res.data.category,
          limit:    4,
        });
        setRelated((relRes.data || []).filter(b => b._id !== res.data._id).slice(0, 3));
      } catch {
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: blog?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* silent */ }
  };

  if (loading) return <Skeleton />;

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <BookOpen size={64} className="text-gray-200 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-700 mb-2">Article Not Found</h1>
          <p className="text-gray-400 mb-6">This article may have been removed or the link is incorrect.</p>
          <Link href="/blog"
            className="inline-flex items-center gap-2 bg-amber-500 text-white font-bold px-6 py-3 rounded-2xl hover:bg-amber-600 transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const heroImg = imgError
    ? FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness
    : blog.image || FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness;

  const cat = CAT_COLORS[blog.category] || CAT_COLORS.Other;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO BANNER ── */}
      <section className="relative h-[420px] md:h-[540px] overflow-hidden">
        {/* Background image */}
        <img
          src={heroImg}
          alt={blog.title}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0 z-10">
          <div className="max-w-5xl mx-auto px-4">
            <nav className="flex items-center gap-2 text-white/70 text-xs font-medium">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={12} />
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <ChevronRight size={12} />
              <span className="text-white/50 truncate max-w-[200px]">{blog.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Category + read time */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-black px-3 py-1.5 rounded-full ${cat.bg}`}>
                {blog.category}
              </span>
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <Clock size={12} /> {readTime(blog.content)} min read
              </span>
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <Eye size={12} /> {blog.views || 0} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 max-w-3xl">
              {blog.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-black">
                  {(blog.authorName || "A").charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-white">{blog.authorName || "FitZone Team"}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {formatDate(blog.publishedAt || blog.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Article body ── */}
          <article className="flex-1 min-w-0">

            {/* Action bar */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <button onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-amber-600 font-semibold text-sm transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-semibold text-sm px-4 py-2 rounded-xl transition-all">
                <Share2 size={14} />
                {copied ? "Copied!" : "Share"}
              </button>
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg text-gray-600 font-medium leading-relaxed mb-8 pl-4 border-l-4 border-amber-400 italic">
                {blog.excerpt}
              </p>
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-black prose-headings:text-gray-800
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5
                prose-strong:text-gray-800 prose-strong:font-bold
                prose-ul:my-4 prose-li:text-gray-600 prose-li:mb-1
                prose-ol:my-4
                prose-blockquote:border-l-4 prose-blockquote:border-amber-400
                prose-blockquote:bg-amber-50 prose-blockquote:px-6 prose-blockquote:py-4
                prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                prose-blockquote:text-gray-700 prose-blockquote:font-medium
                prose-img:rounded-2xl prose-img:shadow-lg
                prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-400" />
                  {blog.tags.map(tag => (
                    <span key={tag}
                      className="text-xs font-semibold bg-gray-100 hover:bg-amber-100 hover:text-amber-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author card */}
            <div className="mt-10 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg">
                {(blog.authorName || "F").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Written by</p>
                <p className="text-lg font-black text-gray-800">{blog.authorName || "FitZone Team"}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Expert fitness coach and wellness writer at FitZone. Passionate about helping people achieve their health goals.
                </p>
              </div>
            </div>

            {/* Back to blog CTA */}
            <div className="mt-10 text-center">
              <Link href="/blog"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-all hover:shadow-lg hover:shadow-amber-200 hover:scale-105">
                <BookOpen size={16} /> Read More Articles
              </Link>
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="lg:w-80 flex-shrink-0 space-y-6">

            {/* Article info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-black text-gray-800 mb-4 uppercase tracking-wider">Article Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Calendar size={14} /> Published</span>
                  <span className="font-semibold text-gray-700">{formatDate(blog.publishedAt || blog.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Clock size={14} /> Read Time</span>
                  <span className="font-semibold text-gray-700">{readTime(blog.content)} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Eye size={14} /> Views</span>
                  <span className="font-semibold text-gray-700">{blog.views || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><User size={14} /> Author</span>
                  <span className="font-semibold text-gray-700">{blog.authorName || "FitZone"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Tag size={14} /> Category</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cat.bg}`}>{blog.category}</span>
                </div>
              </div>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-black text-gray-800 mb-4 uppercase tracking-wider">Related Articles</h3>
                <div className="space-y-1">
                  {related.map(r => <RelatedCard key={r._id} blog={r} />)}
                </div>
                <Link href={`/blog?category=${blog.category}`}
                  className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                  More {blog.category} articles <ChevronRight size={12} />
                </Link>
              </div>
            )}

            {/* CTA card */}
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"
                alt="Join FitZone"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-amber-600/80 to-orange-700/90" />
              <div className="relative z-10 p-6 text-center">
                <p className="text-white font-black text-lg mb-2">Ready to Transform?</p>
                <p className="text-white/80 text-xs mb-4">Join thousands of members achieving their fitness goals.</p>
                <Link href="/membership"
                  className="inline-block bg-white text-amber-600 font-black text-sm px-6 py-2.5 rounded-xl hover:shadow-lg transition-all hover:scale-105">
                  View Plans →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── MORE FROM BLOG ── */}
      {related.length > 0 && (
        <section className="bg-white border-t border-gray-100 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-800">More Articles</h2>
              <Link href="/blog" className="text-amber-500 font-bold text-sm hover:text-amber-600 flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(r => {
                const [err, setErr] = useState(false);
                const img = err
                  ? FALLBACK_IMAGES[r.category] || FALLBACK_IMAGES.Fitness
                  : r.image || FALLBACK_IMAGES[r.category] || FALLBACK_IMAGES.Fitness;
                const c = CAT_COLORS[r.category] || CAT_COLORS.Other;
                return (
                  <Link key={r._id} href={`/blog/${r.slug || r._id}`}
                    className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg border border-gray-100 hover:border-amber-200 transition-all duration-300">
                    <div className="h-44 overflow-hidden relative">
                      <img src={img} alt={r.title} onError={() => setErr(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg}`}>{r.category}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-amber-600 transition-colors">{r.title}</h3>
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <Calendar size={9} /> {formatDate(r.publishedAt || r.createdAt)}
                        <span className="mx-1">·</span>
                        <Clock size={9} /> {readTime(r.content)} min
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
