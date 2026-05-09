"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { blogAPI } from "@/lib/api";
import {
  Calendar, Eye, Clock, ArrowLeft, Tag,
  Share2, BookOpen, ChevronRight,
  Link2, CheckCircle,
} from "lucide-react";

// ── Brand icons (not in lucide-react) ─────────────────────────────
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// ── Category config ────────────────────────────────────────────────
const CAT_COLORS = {
  Fitness:   { bg: "bg-orange-100",  text: "text-orange-700",  dot: "bg-orange-500"  },
  Nutrition: { bg: "bg-green-100",   text: "text-green-700",   dot: "bg-green-500"   },
  Wellness:  { bg: "bg-pink-100",    text: "text-pink-700",    dot: "bg-pink-500"    },
  News:      { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  Tips:      { bg: "bg-yellow-100",  text: "text-yellow-700",  dot: "bg-yellow-500"  },
  Other:     { bg: "bg-gray-100",    text: "text-gray-700",    dot: "bg-gray-500"    },
};

const FALLBACK_IMAGES = {
  Fitness:   "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80",
  Nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80",
  Wellness:  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80",
  News:      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80",
  Tips:      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=80",
  Other:     "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";

const readTime = (content = "") => {
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

// ── Skeleton ───────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[500px] bg-gray-300" />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="space-y-3 pt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Related Card ───────────────────────────────────────────────────
function RelatedCard({ blog }) {
  const [imgErr, setImgErr] = useState(false);
  const img = imgErr
    ? FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness
    : blog.image || FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness;
  const cat = CAT_COLORS[blog.category] || CAT_COLORS.Other;

  return (
    <Link href={`/blog/${blog.slug || blog._id}`}
      className="group flex gap-4 p-3 rounded-2xl hover:bg-amber-50 transition-colors">
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img src={img} alt={blog.title} onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
          {blog.category}
        </span>
        <p className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2 group-hover:text-amber-600 transition-colors leading-snug">
          {blog.title}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Calendar size={10} /> {formatDate(blog.publishedAt || blog.createdAt)}
        </p>
      </div>
    </Link>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function BlogDetailPage() {
  const { slug }  = useParams();
  const router    = useRouter();

  const [blog,    setBlog]    = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [imgErr,  setImgErr]  = useState(false);
  const [copied,  setCopied]  = useState(false);

  // ── Fetch blog ─────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await blogAPI.getOne(slug);
        setBlog(res.data);
        // Fetch related posts (same category)
        try {
          const rel = await blogAPI.getAll({
            status:   "published",
            category: res.data.category,
            limit:    4,
          });
          setRelated((rel.data || []).filter(b => b._id !== res.data._id).slice(0, 3));
        } catch { /* silent */ }
      } catch {
        setError("Blog post not found.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  // ── Copy link ──────────────────────────────────────────────────
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return <Skeleton />;

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <BookOpen size={64} className="text-gray-200 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-700 mb-2">Post Not Found</h1>
          <p className="text-gray-400 mb-6">This article doesn't exist or has been removed.</p>
          <Link href="/blog"
            className="inline-flex items-center gap-2 bg-amber-500 text-white font-bold px-6 py-3 rounded-2xl hover:bg-amber-600 transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const heroImg = imgErr
    ? FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness
    : blog.image || FALLBACK_IMAGES[blog.category] || FALLBACK_IMAGES.Fitness;

  const cat = CAT_COLORS[blog.category] || CAT_COLORS.Other;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO with background image ── */}
      <section className="relative h-[500px] md:h-[580px] flex items-end overflow-hidden">
        {/* Background image */}
        <img
          src={heroImg}
          alt={blog.title}
          onError={() => setImgErr(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        {/* Breadcrumb — top left */}
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

        {/* Back button — top left below breadcrumb */}
        <div className="absolute top-14 left-0 right-0 z-10">
          <div className="max-w-5xl mx-auto px-4">
            <button onClick={() => router.back()}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold bg-white/10 hover:bg-white/20 backdrop-blur px-4 py-2 rounded-full transition-all">
              <ArrowLeft size={15} /> Back
            </button>
          </div>
        </div>

        {/* Hero content — bottom */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-10 md:pb-14">
          {/* Category + read time */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-black px-3 py-1.5 rounded-full ${cat.bg} ${cat.text}`}>
              {blog.category}
            </span>
            <span className="flex items-center gap-1 text-white/70 text-xs font-medium">
              <Clock size={12} /> {readTime(blog.content)} min read
            </span>
            <span className="flex items-center gap-1 text-white/70 text-xs font-medium">
              <Eye size={12} /> {blog.views || 0} views
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 max-w-3xl">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-white/80 text-base md:text-lg max-w-2xl mb-5 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-black">
                {(blog.authorName || "A").charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-white/90">{blog.authorName || "FitZone Team"}</span>
            </div>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
          </div>
        </div>
      </section>

      {/* ── CONTENT AREA ── */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Main Article ── */}
          <article className="flex-1 min-w-0">

            {/* Share bar */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
              <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
                <Share2 size={15} /> Share:
              </span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(blog.title)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors"
              >
                <TwitterIcon />
              </a>
              <button onClick={copyLink}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  copied ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                title="Copy link"
              >
                {copied ? <CheckCircle size={15} /> : <Link2 size={15} />}
              </button>
              {copied && <span className="text-xs text-emerald-600 font-semibold">Copied!</span>}
            </div>

            {/* Blog content */}
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-black prose-headings:text-gray-800
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5
                prose-strong:text-gray-800 prose-strong:font-bold
                prose-ul:text-gray-600 prose-ol:text-gray-600
                prose-li:mb-1.5
                prose-a:text-amber-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-amber-500
                prose-blockquote:bg-amber-50 prose-blockquote:px-6 prose-blockquote:py-4
                prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                prose-blockquote:text-gray-700 prose-blockquote:font-medium
                prose-img:rounded-2xl prose-img:shadow-lg
                prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              "
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={15} className="text-gray-400" />
                  {blog.tags.map(tag => (
                    <span key={tag}
                      className="text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-amber-100 hover:text-amber-700 transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author card */}
            <div className="mt-10 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-md">
                  {(blog.authorName || "F").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">Written by</p>
                  <p className="text-base font-black text-gray-800">{blog.authorName || "FitZone Team"}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Expert fitness writer at FitZone — helping you achieve your health goals.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to blog */}
            <div className="mt-8">
              <Link href="/blog"
                className="inline-flex items-center gap-2 text-amber-600 font-bold hover:text-amber-700 transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to all articles
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
                  <span className="text-gray-500 flex items-center gap-2"><BookOpen size={14} /> Category</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
                    {blog.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-black text-gray-800 mb-4 uppercase tracking-wider">Related Articles</h3>
                <div className="space-y-1 divide-y divide-gray-50">
                  {related.map(r => <RelatedCard key={r._id} blog={r} />)}
                </div>
                <Link href={`/blog?category=${blog.category}`}
                  className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                  More {blog.category} articles <ChevronRight size={12} />
                </Link>
              </div>
            )}

            {/* CTA */}
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"
                alt="Join FitZone"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-amber-600/80 to-orange-700/90" />
              <div className="relative z-10 p-6 text-center">
                <p className="text-white font-black text-lg mb-1">Ready to Start?</p>
                <p className="text-white/80 text-xs mb-4">Join thousands of members achieving their fitness goals.</p>
                <Link href="/membership"
                  className="inline-block bg-white text-amber-600 font-black text-sm px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
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
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-800">More Articles</h2>
              <Link href="/blog" className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(r => {
                const [rImgErr, setRImgErr] = useState(false);
                const rImg = rImgErr
                  ? FALLBACK_IMAGES[r.category] || FALLBACK_IMAGES.Fitness
                  : r.image || FALLBACK_IMAGES[r.category] || FALLBACK_IMAGES.Fitness;
                const rCat = CAT_COLORS[r.category] || CAT_COLORS.Other;
                return (
                  <Link key={r._id} href={`/blog/${r.slug || r._id}`}
                    className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg border border-gray-100 hover:border-amber-200 transition-all duration-300">
                    <div className="h-44 overflow-hidden">
                      <img src={rImg} alt={r.title} onError={() => setRImgErr(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rCat.bg} ${rCat.text}`}>
                        {r.category}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800 mt-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <Calendar size={10} /> {formatDate(r.publishedAt || r.createdAt)}
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
