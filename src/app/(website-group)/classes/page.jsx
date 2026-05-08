"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Zap, Clock, ArrowRight, ChevronLeft, ChevronRight,
  Star, Filter, Users, Loader2, Search, X,
} from "lucide-react";
import { classAPI } from "@/lib/api";

// ── Constants ──────────────────────────────────────────────────────
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "Expert", "All Levels"];
const PER_PAGE = 6;

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "https://fitzone-backend-vis3.onrender.com";

const FALLBACKS = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=450&fit=crop",
];

// Static maps — no dynamic Tailwind
const LEVEL_COLOR = {
  "Beginner":     "from-teal-500 to-cyan-500",
  "Intermediate": "from-blue-500 to-indigo-500",
  "Advanced":     "from-orange-500 to-amber-600",
  "Expert":       "from-red-600 to-orange-600",
  "All Levels":   "from-purple-500 to-indigo-500",
  "default":      "from-amber-500 to-orange-500",
};
const LEVEL_ICON = {
  "Beginner": "🌱", "Intermediate": "💪", "Advanced": "⚡",
  "Expert": "🏋️", "All Levels": "🎯", "default": "🏃",
};

// ── Helpers ────────────────────────────────────────────────────────
const resolveImg = (img, idx = 0) => {
  if (!img) return FALLBACKS[idx % FALLBACKS.length];
  if (img.startsWith("http")) return img;
  return `${BASE_URL}/${img.replace(/^\//, "")}`;
};

const normalize = (cls, idx) => ({
  _id:         cls._id,
  name:        cls.name || "Fitness Class",
  time:        cls.startTime && cls.endTime ? `${cls.startTime}–${cls.endTime}` : "—",
  duration:    cls.duration ? `${cls.duration} min` : null,
  intensity:   cls.intensity || "",
  image:       resolveImg(cls.image || cls.thumbnail, idx),
  color:       LEVEL_COLOR[cls.level] || LEVEL_COLOR.default,
  icon:        LEVEL_ICON[cls.level]  || LEVEL_ICON.default,
  calories:    cls.calories || "",
  level:       cls.level || "All Levels",
  spots:       cls.capacity != null && cls.enrolled != null
                 ? `${Math.max(0, cls.capacity - cls.enrolled)} spots left`
                 : cls.capacity ? `${cls.capacity} capacity` : "Open",
  trainer:     cls.trainer?.name || cls.trainerName || "Expert Trainer",
  trainerPhoto:resolveImg(cls.trainer?.photo, idx),
  rating:      cls.trainer?.rating || cls.rating || 4.8,
  description: cls.description || "",
  schedule:    Array.isArray(cls.days) && cls.days.length ? cls.days.join(", ") : "Daily",
  isPaid:      cls.isPaid || false,
  price:       cls.price || 0,
  enrolled:    cls.enrolled || 0,
  capacity:    cls.capacity || 0,
  status:      cls.status || "Active",
});

// ── Page ───────────────────────────────────────────────────────────
export default function ClassesPage() {
  const [raw,          setRaw]          = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile,     setIsMobile]     = useState(false);
  const [isTablet,     setIsTablet]     = useState(false);
  const [filter,       setFilter]       = useState("All");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const autoRef = useRef(null);

  // ── Responsive ─────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await classAPI.getPublic({ limit: 50 });
        if (!cancelled) setRaw(res.data || res.classes || []);
      } catch {
        if (!cancelled) setRaw([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Derived data ───────────────────────────────────────────────
  const all      = raw.map(normalize);
  const slidesToShow = isMobile ? 1 : isTablet ? 2 : 3;
  const maxSlide = Math.max(0, all.length - slidesToShow);

  const filtered = all.filter(c => {
    const matchLevel  = filter === "All" || c.level === filter;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.trainer.toLowerCase().includes(search.toLowerCase()) ||
                        c.description.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Auto-slide ─────────────────────────────────────────────────
  useEffect(() => {
    if (all.length === 0) return;
    autoRef.current = setInterval(() => {
      setCurrentSlide(p => (p >= maxSlide ? 0 : p + 1));
    }, 3000);
    return () => clearInterval(autoRef.current);
  }, [all.length, maxSlide]);

  const navSlide = (dir) => {
    clearInterval(autoRef.current);
    setCurrentSlide(p => dir === "prev" ? Math.max(0, p - 1) : Math.min(maxSlide, p + 1));
    autoRef.current = setInterval(() => {
      setCurrentSlide(p => (p >= maxSlide ? 0 : p + 1));
    }, 3000);
  };

  const handleFilter = (l) => { setFilter(l); setPage(1); };
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  // ── Card component ─────────────────────────────────────────────
  const ClassCard = ({ cls, compact = false }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
      {/* Image */}
      <div className={`relative ${compact ? "h-40" : "h-48"} overflow-hidden flex-shrink-0`}>
        <img
          src={cls.image}
          alt={cls.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = FALLBACKS[0]; }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${cls.color} opacity-40`} />

        {/* Level badge */}
        <div className={`absolute top-3 right-3 bg-gradient-to-r ${cls.color} px-2 py-1 rounded-lg text-xs font-bold text-white shadow-md z-10`}>
          {cls.icon} {cls.level}
        </div>

        {/* Spots badge */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-white z-10">
          {cls.spots}
        </div>

        {/* Time badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1 z-10">
          <Clock className="w-3 h-3" />
          {cls.duration || cls.time}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span className="text-sm font-semibold text-gray-700">{cls.rating}</span>
          <span className="text-xs text-gray-400">(reviews)</span>
        </div>

        {/* Name & trainer */}
        <h3 className="text-base font-bold text-gray-800 mb-0.5">{cls.name}</h3>
        <p className="text-xs text-gray-500 mb-1">👤 {cls.trainer}</p>

        {/* Schedule */}
        <p className="text-xs text-amber-600 font-medium mb-1.5">📅 {cls.schedule}</p>

        {/* Description */}
        {cls.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2 flex-1">{cls.description}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 flex-wrap gap-1">
          {cls.calories && <span>🔥 {cls.calories}</span>}
          {cls.intensity && <span>⚡ {cls.intensity}</span>}
          {cls.capacity > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {cls.enrolled}/{cls.capacity}
            </span>
          )}
          {cls.isPaid && (
            <span className="text-amber-600 font-semibold">₹{cls.price}/session</span>
          )}
        </div>

        {/* CTA */}
        <a
          href="/membership"
          className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-auto"
        >
          Register Now <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="min-h-[60vh] flex flex-col justify-center bg-gradient-to-br from-amber-50 to-orange-50 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-amber-700 font-semibold text-sm uppercase tracking-wide">Our Programs</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3">
              Popular <span className="text-amber-500">Classes</span>
            </h1>
            <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-4" />
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
              Find the perfect class for your fitness journey. Expert-led sessions for all levels.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { val: loading ? "..." : `${raw.length}+`, label: "Classes Available" },
              { val: loading ? "..." : `${new Set(raw.map(c => c.trainerName || c.trainer?.name)).size}+`, label: "Expert Trainers" },
              { val: "5K+",  label: "Active Members" },
              { val: "24/7", label: "Gym Access" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-md border border-amber-100">
                <p className="text-2xl md:text-3xl font-bold text-amber-500">{s.val}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED SLIDER ── */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Featured <span className="text-amber-500">Classes</span>
            </h2>
            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-2" />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : all.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No classes available yet.</p>
          ) : (
            <>
              <div className="relative group">
                <div className="overflow-hidden rounded-xl">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` }}
                  >
                    {all.map((cls, i) => (
                      <div key={cls._id || i} className="flex-shrink-0 px-2" style={{ width: `${100 / slidesToShow}%` }}>
                        <ClassCard cls={cls} />
                      </div>
                    ))}
                  </div>
                </div>

                {!isMobile && (
                  <>
                    <button onClick={() => navSlide("prev")} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 hover:text-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => navSlide("next")} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 hover:text-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-5">
                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? "w-6 bg-amber-500" : "w-2 bg-gray-300 hover:bg-amber-300"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── ALL CLASSES ── */}
      <section className="py-12 bg-gradient-to-br from-amber-50 to-white">
        <div className="container mx-auto px-4">

          {/* Header + filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                All <span className="text-amber-500">Classes</span>
              </h2>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes or trainers..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-amber-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                />
                {search && (
                  <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Level filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-amber-500 flex-shrink-0" />
              {LEVELS.map(l => (
                <button key={l} onClick={() => handleFilter(l)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    filter === l
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                      : "bg-white border border-amber-200 text-gray-600 hover:border-amber-500 hover:text-amber-600"
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <p className="text-xs text-gray-400 mb-4">
            Showing {paged.length} of {filtered.length} classes
            {filter !== "All" ? ` · ${filter}` : ""}
            {search ? ` · "${search}"` : ""}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-white rounded-2xl animate-pulse shadow-md" />
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No classes found.</p>
              {(filter !== "All" || search) && (
                <button onClick={() => { handleFilter("All"); handleSearch(""); }}
                  className="mt-3 text-amber-500 text-sm font-semibold hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paged.map((cls, i) => (
                <ClassCard key={cls._id || i} cls={cls} compact />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-amber-200 text-gray-600 hover:bg-amber-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                    page === p
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                      : "border border-amber-200 text-gray-600 hover:bg-amber-500 hover:text-white"
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-amber-200 text-gray-600 hover:bg-amber-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
