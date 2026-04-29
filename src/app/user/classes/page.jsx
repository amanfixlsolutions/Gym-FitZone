"use client";
import React, { useState, useEffect } from "react";
import { Zap, Clock, ArrowRight, ChevronLeft, ChevronRight, Star, Filter } from "lucide-react";

const classes = [
  { id: 1, name: "HIIT Training", time: "45 min", intensity: "High", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=450&fit=crop", color: "from-red-500 to-orange-500", icon: "⚡", calories: "450-600 cal", level: "Advanced", spots: "8 spots left", trainer: "Sarah Johnson", rating: 4.9, description: "High Intensity Interval Training for maximum calorie burn and endurance building.", schedule: "Mon, Wed, Fri · 6:00 AM" },
  { id: 2, name: "Power Yoga", time: "60 min", intensity: "Medium", image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=450&fit=crop", color: "from-amber-400 to-orange-400", icon: "🧘", calories: "250-350 cal", level: "All Levels", spots: "12 spots left", trainer: "Emma Davis", rating: 4.8, description: "Strengthen your body and calm your mind with dynamic yoga flows.", schedule: "Tue, Thu · 7:00 AM" },
  { id: 3, name: "Strength Training", time: "50 min", intensity: "High", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=450&fit=crop", color: "from-orange-500 to-amber-600", icon: "💪", calories: "400-550 cal", level: "Intermediate", spots: "5 spots left", trainer: "Mike Chen", rating: 4.9, description: "Build muscle, increase strength and boost metabolism with progressive overload.", schedule: "Mon, Wed, Fri · 5:00 PM" },
  { id: 4, name: "Cardio Blast", time: "35 min", intensity: "Very High", image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&h=450&fit=crop", color: "from-pink-500 to-rose-500", icon: "🏃", calories: "500-700 cal", level: "Advanced", spots: "3 spots left", trainer: "Jessica Lee", rating: 4.7, description: "Explosive cardio workout to torch calories and improve cardiovascular health.", schedule: "Tue, Thu, Sat · 7:00 AM" },
  { id: 5, name: "Zumba Dance", time: "55 min", intensity: "Medium", image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=450&fit=crop", color: "from-purple-500 to-indigo-500", icon: "💃", calories: "350-500 cal", level: "Beginner", spots: "15 spots left", trainer: "Maria Garcia", rating: 4.8, description: "Dance your way to fitness with Latin-inspired moves and upbeat music.", schedule: "Mon-Sat · 9:00 AM" },
  { id: 6, name: "CrossFit", time: "70 min", intensity: "Extreme", image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=450&fit=crop", color: "from-red-600 to-orange-600", icon: "🏋️", calories: "600-800 cal", level: "Expert", spots: "2 spots left", trainer: "Alex Turner", rating: 5.0, description: "Functional fitness combining weightlifting, gymnastics and metabolic conditioning.", schedule: "Sat, Sun · 8:00 AM" },
  { id: 7, name: "Pilates Core", time: "45 min", intensity: "Low", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&h=450&fit=crop", color: "from-teal-500 to-cyan-500", icon: "🤸", calories: "200-300 cal", level: "Beginner", spots: "10 spots left", trainer: "Sunita Rao", rating: 4.8, description: "Core-focused exercises to improve posture, flexibility and body awareness.", schedule: "Mon, Wed · 10:00 AM" },
  { id: 8, name: "Boxing Basics", time: "60 min", intensity: "High", image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=450&fit=crop", color: "from-gray-700 to-gray-900", icon: "🥊", calories: "500-650 cal", level: "Intermediate", spots: "6 spots left", trainer: "Karan Mehta", rating: 4.6, description: "Learn boxing fundamentals while getting an incredible full-body workout.", schedule: "Tue, Thu, Sat · 6:00 PM" },
  { id: 9, name: "Meditation", time: "30 min", intensity: "Low", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=450&fit=crop", color: "from-violet-500 to-purple-600", icon: "🧠", calories: "50-100 cal", level: "All Levels", spots: "20 spots left", trainer: "Meera Nair", rating: 4.9, description: "Mindfulness and meditation sessions to reduce stress and improve mental clarity.", schedule: "Daily · 7:00 AM" },
];

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "Expert", "All Levels"];
const PER_PAGE = 6;

export default function ClassesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const resize = () => { setIsMobile(window.innerWidth < 768); setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024); };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const slidesToShow = isMobile ? 1 : isTablet ? 2 : 3;
  const maxSlide = classes.length - slidesToShow;
  const filtered = filter === "All" ? classes : classes.filter(c => c.level === filter);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-24 pb-10 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-amber-700 font-semibold text-sm uppercase tracking-wide">Our Programs</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Popular <span className="text-amber-500">Classes</span></h1>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-4" />
          <p className="text-black text-sm md:text-base max-w-xl mx-auto">Find the perfect class for your fitness journey. Expert-led sessions for all levels.</p>
        </div>
      </section>

      {/* Featured Slider */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Featured Classes</h2>
          <div className="relative group">
            <div className="overflow-hidden rounded-xl">
              <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` }}>
                {classes.map((cls, i) => (
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
                        <div className="flex items-center gap-1 mb-1"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><span className="text-sm font-semibold text-gray-700">{cls.rating}</span><span className="text-xs text-black">(895 reviews)</span></div>
                        <h3 className="text-base font-bold text-gray-800 mb-0.5">{cls.name}</h3>
                        <p className="text-xs text-black mb-2">{cls.trainer}</p>
                        <p className="text-xs text-black mb-3 line-clamp-2">{cls.description}</p>
                        <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">Register Now <ArrowRight className="w-4 h-4" /></button>
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
        </div>
      </section>

      {/* All Classes */}
      <section className="py-10 bg-gradient-to-br from-amber-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">All Classes</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-amber-500" />
              {LEVELS.map(l => (
                <button key={l} onClick={() => { setFilter(l); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${filter === l ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" : "bg-white border border-amber-200 text-gray-600 hover:border-amber-500 hover:text-amber-600"}`}>{l}</button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-5">Showing {paged.length} of {filtered.length} classes{filter !== "All" ? ` · ${filter}` : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paged.map((cls) => (
              <div key={cls.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="relative h-44 overflow-hidden">
                  <img src={cls.image} alt={cls.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cls.color} opacity-40`} />
                  <div className={`absolute top-3 right-3 bg-gradient-to-r ${cls.color} px-2 py-1 rounded-lg text-xs font-bold text-white`}>{cls.icon} {cls.level}</div>
                  <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded-lg text-xs font-bold text-white">{cls.spots}</div>
                  <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1"><Clock className="w-3 h-3" />{cls.time}</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><span className="text-sm font-semibold text-gray-700">{cls.rating}</span><span className="text-xs text-black">(895 reviews)</span></div>
                  <h3 className="text-base font-bold text-gray-800 mb-0.5">{cls.name}</h3>
                  <p className="text-xs text-black mb-1">{cls.trainer}</p>
                  <p className="text-xs text-amber-600 font-medium mb-2">📅 {cls.schedule}</p>
                  <p className="text-xs text-black mb-3 line-clamp-2">{cls.description}</p>
                  <div className="flex items-center justify-between text-xs text-black mb-3"><span>🔥 {cls.calories}</span><span>⚡ {cls.intensity}</span></div>
                  <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">Register Now <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
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
