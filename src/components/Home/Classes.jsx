"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Clock, ArrowRight, ChevronLeft, ChevronRight, Star, Loader2 } from 'lucide-react';
import { classAPI } from '@/lib/api';

// Static color/icon map — no dynamic Tailwind
const CATEGORY_STYLES = {
  "HIIT":     { color: "from-red-500 to-orange-500",    icon: "⚡" },
  "Yoga":     { color: "from-amber-400 to-orange-400",  icon: "🧘" },
  "Strength": { color: "from-orange-500 to-amber-600",  icon: "💪" },
  "Cardio":   { color: "from-pink-500 to-rose-500",     icon: "🏃" },
  "Zumba":    { color: "from-purple-500 to-indigo-500", icon: "💃" },
  "CrossFit": { color: "from-red-600 to-orange-600",    icon: "🏋️" },
  "Boxing":   { color: "from-blue-500 to-cyan-500",     icon: "🥊" },
  "Pilates":  { color: "from-teal-500 to-emerald-500",  icon: "🤸" },
  "Cycling":  { color: "from-green-500 to-lime-500",    icon: "🚴" },
  "default":  { color: "from-amber-500 to-orange-500",  icon: "🏅" },
};

const getStyle = (text = "") => {
  const key = Object.keys(CATEGORY_STYLES).find(k =>
    text.toLowerCase().includes(k.toLowerCase())
  );
  return CATEGORY_STYLES[key || "default"];
};

const FALLBACK = "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=450&fit=crop";

const BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
    : "https://fitzone-backend-vis3.onrender.com");

const resolveImg = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_URL}/${img.replace(/^\//, "")}`;
};

const Classes = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile,  setIsMobile]  = useState(false);
  const [isTablet,  setIsTablet]  = useState(false);
  const [classes,   setClasses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const autoSlideRef = useRef(null);

  // ── Fetch from backend ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await classAPI.getPublic({ limit: 12 });
        if (!cancelled) {
          const list = res.data || res.classes || [];
          setClasses(list);
        }
      } catch {
        if (!cancelled) setClasses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Responsive ─────────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const slidesToShow = isMobile ? 1 : isTablet ? 2 : 3;
  const maxIndex = Math.max(0, classes.length - slidesToShow);

  // ── Auto-slide ─────────────────────────────────────────────────
  useEffect(() => {
    if (classes.length === 0) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex(p => (p >= maxIndex ? 0 : p + 1));
    }, 2500);
    return () => clearInterval(autoSlideRef.current);
  }, [classes.length, maxIndex]);

  const nav = (cb) => {
    clearInterval(autoSlideRef.current);
    cb();
    autoSlideRef.current = setInterval(() => {
      setCurrentIndex(p => (p >= maxIndex ? 0 : p + 1));
    }, 2500);
  };

  const prev = () => nav(() => setCurrentIndex(p => (p <= 0 ? maxIndex : p - 1)));
  const next = () => nav(() => setCurrentIndex(p => (p >= maxIndex ? 0 : p + 1)));
  const goto = (i) => nav(() => setCurrentIndex(i));

  // ── Normalize ──────────────────────────────────────────────────
  const normalize = (c) => {
    const style = getStyle(c.category || c.name || "");
    const spots = c.capacity != null && c.enrolled != null
      ? `${c.capacity - c.enrolled} spots left`
      : `${c.capacity || "—"} capacity`;
    const time = c.startTime && c.endTime
      ? `${c.startTime}–${c.endTime}`
      : c.duration ? `${c.duration} min` : "45 min";
    return {
      _id:         c._id,
      name:        c.name || "Fitness Class",
      time,
      level:       c.level || "All Levels",
      image:       resolveImg(c.image || c.thumbnail) || FALLBACK,
      color:       style.color,
      icon:        style.icon,
      calories:    c.calories || "300–500 cal",
      spots,
      trainer:     c.trainer?.name || c.trainerName || "Expert Trainer",
      rating:      c.rating || 4.8,
      description: c.description || c.category || c.name || "Fitness Class",
    };
  };

  return (
    <section id="classes" className="py-8 md:py-10 bg-gradient-to-br from-amber-50 to-white">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center mb-5 md:mb-7">
          <div className="inline-flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-full mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-700 font-semibold text-xs uppercase">Our Programs</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Popular <span className="text-amber-500">Classes</span>
          </h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-3" />
          <p className="text-gray-600 text-sm mt-2">Find the perfect class for your fitness journey</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && classes.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No classes available right now. Check back soon!
          </div>
        )}

        {/* Slider */}
        {!loading && classes.length > 0 && (
          <>
            <div className="relative group">
              <div className="overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)` }}
                >
                  {classes.map((raw, idx) => {
                    const c = normalize(raw);
                    return (
                      <div
                        key={c._id || idx}
                        className="flex-shrink-0 px-2"
                        style={{ width: `${100 / slidesToShow}%` }}
                      >
                        <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md transition-all duration-300 h-full class-card">
                          {/* Image */}
                          <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                            <img
                              src={c.image}
                              alt={c.name}
                              className="w-full h-full object-cover transition-transform duration-500"
                              onError={(e) => { e.target.src = FALLBACK; }}
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${c.color} opacity-40`} />

                            {/* Level badge */}
                            <div className={`absolute top-2 right-2 md:top-3 md:right-3 bg-gradient-to-r ${c.color} px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-xs font-bold text-white shadow-md z-10`}>
                              {c.icon} {c.level}
                            </div>

                            {/* Spots badge */}
                            <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-[11px] font-bold text-white z-10">
                              {c.spots}
                            </div>

                            {/* Time badge */}
                            <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-[11px] font-bold text-white flex items-center gap-1 z-10">
                              <Clock className="w-2 h-2 md:w-3 md:h-3" />
                              {c.time}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3 md:p-4">
                            <div className="flex items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
                              <Star className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 fill-amber-500 text-amber-500" />
                              <span className="text-[10px] md:text-sm font-semibold text-gray-800">{c.rating}</span>
                              <span className="text-[8px] md:text-xs text-gray-500">(reviews)</span>
                            </div>
                            <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-0.5 md:mb-1">{c.name}</h3>
                            <p className="text-[9px] md:text-xs text-gray-600 mb-2 md:mb-3">{c.trainer}</p>
                            <p className="text-[10px] md:text-sm text-gray-600 mb-2 md:mb-3 line-clamp-2">
                              {c.description} • {c.calories}
                            </p>
                            <a
                              href="/membership"
                              className="w-full py-1.5 md:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] md:text-sm font-semibold rounded-lg md:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 md:gap-2"
                            >
                              <span>Register Now</span>
                              <ArrowRight className="w-2.5 h-2.5 md:w-4 md:h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop arrows */}
              {!isMobile && (
                <>
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 shadow-lg rounded-full p-2 hover:text-white transition-all duration-300 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 shadow-lg rounded-full p-2 hover:text-white transition-all duration-300 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Desktop dots */}
            <div className="hidden md:flex justify-center gap-2 mt-6 mb-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button key={i} onClick={() => goto(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${currentIndex === i ? "w-6 bg-amber-500" : "w-2 bg-gray-300 hover:bg-amber-300"}`}
                />
              ))}
            </div>

            {/* Mobile nav */}
            <div className="mt-6 md:hidden flex justify-center items-center gap-3">
              <button onClick={prev} className="bg-white shadow-md rounded-full p-2 hover:bg-amber-500 hover:text-white transition-all w-8 h-8 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                  <button key={i} onClick={() => goto(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? "w-5 bg-amber-500" : "w-1.5 bg-gray-300"}`}
                  />
                ))}
              </div>
              <button onClick={next} className="bg-white shadow-md rounded-full p-2 hover:bg-amber-500 hover:text-white transition-all w-8 h-8 flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .class-card:hover {
          transform: scale(1.02);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .flex-shrink-0:hover { z-index: 10; }
      `}</style>
    </section>
  );
};

export default Classes;
