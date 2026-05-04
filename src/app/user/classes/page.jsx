"use client";
import React, { useState, useEffect } from "react";
import { Zap, Clock, ArrowRight, ChevronLeft, ChevronRight, Star, Filter, Users, RefreshCw } from "lucide-react";
import { classAPI } from "@/lib/api";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "Expert", "All Levels"];
const PER_PAGE = 6;

// ── Level → gradient color ─────────────────────────────────────────
const levelColor = {
  "Beginner":     "from-teal-500 to-cyan-500",
  "Intermediate": "from-blue-500 to-indigo-500",
  "Advanced":     "from-orange-500 to-amber-600",
  "Expert":       "from-red-600 to-orange-600",
  "All Levels":   "from-purple-500 to-indigo-500",
};

const levelIcon = {
  "Beginner": "🌱", "Intermediate": "💪", "Advanced": "⚡",
  "Expert": "🏋️", "All Levels": "🎯",
};

// ── Fallback image per level ───────────────────────────────────────
const fallbackImages = [
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=450&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=450&fit=crop",
];

export default function ClassesPage() {
  const [classes,      setClasses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile,     setIsMobile]     = useState(false);
  const [isTablet,     setIsTablet]     = useState(false);
  const [filter,       setFilter]       = useState("All");
  const [page,         setPage]         = useState(1);

  useEffect(() => {
    const resize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ── Fetch real classes from backend ───────────────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await classAPI.getAll({ status: "Active", limit: 50 });
        setClasses(res.data || []);
      } catch {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const slidesToShow = isMobile ? 1 : isTablet ? 2 : 3;
  const maxSlide     = Math.max(0, classes.length - slidesToShow);
  const filtered     = filter === "All" ? classes : classes.filter(c => c.level === filter);
  const totalPages   = Math.ceil(filtered.length / PER_PAGE);
  const paged        = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Normalize class data from backend ─────────────────────────
  const normalizeClass = (cls, idx) => ({
    id:          cls._id,
    name:        cls.name,
    time:        cls.startTime && cls.endTime ? `${cls.startTime}–${cls.endTime}` : "—",
    intensity:   cls.intensity || "Medium",
    image:       cls.image || fallbackImages[idx % fallbackImages.length],
    color:       levelColor[cls.level] || "from-amber-500 to-orange-500",
    icon:        levelIcon[cls.level]  || "🏃",
    calories:    cls.calories || "300-500 cal",
    level:       cls.level || "All Levels",
    spots:       cls.capacity ? `${cls.capacity - (cls.enrolled || 0)} spots left` : "Open",
    trainer:     cls.trainerName || "Expert Trainer",
    rating:      cls.trainer?.rating || 4.8,
    description: cls.description || "Expert-led fitness class for all levels.",
    schedule:    cls.days?.join(", ") || "Daily",
    isPaid:      cls.isPaid,
    price:       cls.price,
    enrolled:    cls.enrolled || 0,
    capacity:    cls.capacity || 30,
  });

  const normalizedClasses  = classes.map(normalizeClass);
  const normalizedFiltered = filtered.map(normalizeClass);
  const normalizedPaged    = paged.map(normalizeClass);

  return (
    <div className="bg-white">

      {/* ── SECTION 1: Hero ── */}
      <section className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-amber-50 to-orange-50 pt-16">
        <div className="container mx-auto px-4 py-10">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { val: loading ? "..." : `${classes.length}+`, label: "Classes Available" },
              { val: "30+",  label: "Expert Trainers" },
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

      {/* ── SECTION 2: Featured Slider ── */}
      <section className="min-h-screen flex flex-col justify-center bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured <span className="text-amber-500">Classes</span></h2>
            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-2" />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : normalizedClasses.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No classes available yet. Check back soon!</p>
          ) : (
            <>
              <div className="relative group">
                <div className="overflow-hidden rounded-xl">
                  <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` }}>
                    {normalizedClasses.map((cls, i) => (
                      <div key={i} className="flex-shrink-0 px-2" style={{ width: `${100 / slidesToShow}%` }}>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                          <div className="relative h-44 overflow-hidden">
                            <img src={cls.image} alt={cls.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                            <div className={`absolute inset-0 bg-gradient-to-t ${cls.color} opacity-40`} />
                            <div className={`absolute top-3 right-3 bg-gradient-to-r ${cls.color} px-2 py-1 rounded-lg text-xs font-bold text-white shadow-md`}>{cls.icon} {cls.level}</div>
                            <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded-lg text-xs font-bold text-white">{cls.spots}</div>
                            <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1"><Clock className="w-3 h-3" />{cls.time}</div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span className="text-sm font-semibold text-gray-700">{cls.rating}</span>
                            </div>
                            <h3 className="text-base font-bold text-gray-800 mb-0.5">{cls.name}</h3>
                            <p className="text-xs text-gray-500 mb-1">{cls.trainer}</p>
                            {cls.isPaid && <p className="text-xs text-amber-600 font-semibold mb-1">₹{cls.price}/session</p>}
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{cls.description}</p>
                            <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                              Register Now <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {!isMobile && (<>
                  <button onClick={() => setCurrentSlide(p => Math.max(0, p - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 hover:text-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentSlide(p => Math.min(maxSlide, p + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 hover:text-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"><ChevronRight className="w-5 h-5" /></button>
                </>)}
              </div>
              <div className="flex justify-center gap-2 mt-5">
                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? "w-6 bg-amber-500" : "w-2 bg-gray-300 hover:bg-amber-300"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── SECTION 3: All Classes ── */}
      <section className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-amber-50 to-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">All <span className="text-amber-500">Classes</span></h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-amber-500" />
              {LEVELS.map(l => (
                <button key={l} onClick={() => { setFilter(l); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${filter === l ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" : "bg-white border border-amber-200 text-gray-600 hover:border-amber-500 hover:text-amber-600"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Showing {normalizedPaged.length} of {normalizedFiltered.length} classes{filter !== "All" ? ` · ${filter}` : ""}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse shadow-md" />)}
            </div>
          ) : normalizedPaged.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No classes found for this level.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {normalizedPaged.map((cls) => (
                <div key={cls.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="relative h-40 overflow-hidden">
                    <img src={cls.image} alt={cls.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cls.color} opacity-40`} />
                    <div className={`absolute top-3 right-3 bg-gradient-to-r ${cls.color} px-2 py-1 rounded-lg text-xs font-bold text-white`}>{cls.icon} {cls.level}</div>
                    <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded-lg text-xs font-bold text-white">{cls.spots}</div>
                    <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1"><Clock className="w-3 h-3" />{cls.time}</div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-semibold text-gray-700">{cls.rating}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 mb-0.5">{cls.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">{cls.trainer}</p>
                    <p className="text-xs text-amber-600 font-medium mb-2">📅 {cls.schedule}</p>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{cls.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>🔥 {cls.calories}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cls.enrolled}/{cls.capacity}</span>
                      {cls.isPaid && <span className="text-amber-600 font-semibold">₹{cls.price}</span>}
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                      Register Now <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 flex items-center justify-center rounded-full border border-amber-200 text-gray-600 hover:bg-amber-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${page === p ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" : "border border-amber-200 text-gray-600 hover:bg-amber-500 hover:text-white"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-9 h-9 flex items-center justify-center rounded-full border border-amber-200 text-gray-600 hover:bg-amber-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </section>
      <style>{`.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}`}</style>
    </div>
  );
}
