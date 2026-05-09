"use client";
import React, { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Award, Clock, Users, Calendar, X, RefreshCw } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { trainerAPI } from "@/lib/api";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "https://fitzone-backend-vis3.onrender.com/api").replace(/\/api$/, "");
const resolvePhoto = (p) => {
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${BACKEND}${p.startsWith("/") ? "" : "/"}${p}`;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
];

const PER_PAGE = 6;

export default function TrainersPage() {
  const [trainers,     setTrainers]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile,     setIsMobile]     = useState(false);
  const [isTablet,     setIsTablet]     = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [page,         setPage]         = useState(1);
  
  const timerRef = useRef(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const resize = () => { setIsMobile(window.innerWidth < 768); setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024); };
    resize(); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize);
  }, []);

  // ── Fetch real trainers from backend ──────────────────────────
  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      try {
        const res = await trainerAPI.getPublic({ status: "Active", limit: 50 });
        setTrainers(res.data || []);
      } catch {
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainers();
  }, []);

  const slidesToShow = isMobile ? 1 : isTablet ? 2 : 4;
  const maxSlide     = Math.max(0, trainers.length - slidesToShow);
  const totalPages   = Math.ceil(trainers.length / PER_PAGE);
  const paged        = trainers.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const openLink     = (url, e) => { e.stopPropagation(); window.open(url, "_blank"); };

  // Auto-slide timer function
  const startAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (trainers.length > 0 && !loading && !isHoveringRef.current) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          const next = prev + 1;
          if (next > maxSlide) {
            return 0;
          }
          return next;
        });
      }, 3000);
    }
  };

  // Stop auto-slide
  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Handle auto-slide when trainers load or maxSlide changes
  useEffect(() => {
    if (!loading && trainers.length > 0) {
      startAutoSlide();
    }
    return () => stopAutoSlide();
  }, [trainers.length, loading, maxSlide]);

  // Handle manual slide change
  const handleSlideChange = (newSlide) => {
    setCurrentSlide(newSlide);
    // Restart timer on manual interaction
    stopAutoSlide();
    startAutoSlide();
  };

  // Mouse enter/leave handlers for smooth pause/resume
  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    stopAutoSlide();
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    startAutoSlide();
  };

  // ── Normalize trainer from backend ────────────────────────────
  const norm = (t, idx) => ({
    id:           t._id,
    name:         t.name,
    role:         t.specialty || "Fitness Trainer",
    image:        resolvePhoto(t.photo) || fallbackImages[idx % fallbackImages.length],
    experience:   t.experience || "3+ years",
    achievements: t.certification || "Certified Trainer",
    rating:       t.rating || 4.8,
    specialties:  t.specialties?.length ? t.specialties : [t.specialty || "Fitness"],
    certification:t.certification || "Certified",
    clients:      t.totalClients ? `${t.totalClients}+` : "100+",
    bio:          t.bio || `${t.name} is a certified fitness professional dedicated to helping clients achieve their goals.`,
    available:    t.status === "Active" && t.available !== false,
    social:       t.social || {},
  });

  const normTrainers = trainers.map(norm);
  const normPaged    = paged.map(norm);

  return (
    <div className="bg-white">

      {/* ── SECTION 1: Hero ── */}
      <section className="min-h-screen flex flex-col justify-center bg-white pt-16">
        <div className="container mx-auto px-4 py-10 text-center">
          <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">Meet Our Team</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mt-2 mb-3">
            Meet Our <span className="text-amber-500">Expert Trainers</span>
          </h1>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mb-4" />
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto mb-10">
            Learn from the best certified fitness professionals in the industry.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { val: loading ? "..." : `${trainers.length}+`, label: "Expert Trainers" },
              { val: "3K+",  label: "Happy Clients" },
              { val: "15+",  label: "Specialties" },
              { val: loading ? "..." : trainers.length > 0 ? `${(trainers.reduce((s, t) => s + (t.rating || 4.8), 0) / trainers.length).toFixed(1)}★` : "4.8★", label: "Avg Rating" },
            ].map((s, i) => (
              <div key={i} className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
                <p className="text-2xl md:text-3xl font-bold text-amber-500">{s.val}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Featured Slider ── */}
      <section className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-amber-50 to-white py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured <span className="text-amber-500">Trainers</span></h2>
            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-2" />
            <p className="text-xs text-gray-400 mt-2">Click a card to view full profile</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 text-amber-500 animate-spin" /></div>
          ) : normTrainers.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No trainers available yet.</p>
          ) : (
            <>
              <div 
                className="relative group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="overflow-hidden rounded-xl">
                  <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` }}>
                    {normTrainers.map((t, i) => (
                      <div key={i} className="flex-shrink-0 px-2" style={{ width: `${100 / slidesToShow}%` }}>
                        <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer" onClick={() => setSelected(t)}>
                          <div className="relative">
                            <div className="relative w-full pt-[100%]">
                              <img src={t.image} alt={t.name} className="absolute top-0 left-0 w-full h-full object-cover" onError={e => { e.currentTarget.src = fallbackImages[i % fallbackImages.length]; }} />
                            </div>
                            <div className="absolute top-2 right-2 bg-white/95 px-1.5 py-0.5 rounded-lg shadow-md flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /><span className="text-[10px] font-bold text-gray-800">{t.rating}</span></div>
                            <div className="absolute bottom-2 left-2 bg-black/70 px-1.5 py-0.5 rounded-lg flex items-center gap-1"><Clock className="w-2 h-2 text-amber-400" /><span className="text-[8px] font-bold text-white">{t.experience}</span></div>
                            {!t.available && <div className="absolute top-2 left-2 bg-red-500 px-1.5 py-0.5 rounded-lg text-[8px] font-bold text-white">Busy</div>}
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-bold text-gray-800 truncate">{t.name}</h3>
                            <p className="text-[10px] text-amber-500 font-medium mt-0.5">{t.role}</p>
                            <div className="mt-1.5"><span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full"><Award className="w-2 h-2" />{t.achievements}</span></div>
                            <div className="flex gap-2 justify-center mt-2.5">
                              {[FaFacebook, FaInstagram, FaTwitter].map((Icon, j) => (
                                <button key={j} onClick={(e) => openLink(t.social?.facebook || t.social?.instagram || "https://example.com", e)} className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all duration-300 text-amber-600"><Icon className="w-3 h-3" /></button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {!isMobile && (<>
                  <button onClick={() => handleSlideChange(Math.max(0, currentSlide - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 hover:text-white shadow-lg rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => handleSlideChange(Math.min(maxSlide, currentSlide + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-amber-500 hover:text-white shadow-lg rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300"><ChevronRight className="w-4 h-4" /></button>
                </>)}
              </div>
              <div className="flex justify-center gap-2 mt-5">
                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                  <button key={i} onClick={() => handleSlideChange(i)} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? "w-6 bg-amber-500" : "w-2 bg-gray-300 hover:bg-amber-300"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── SECTION 3: All Trainers ── */}
      <section className="min-h-screen flex flex-col justify-center bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">All <span className="text-amber-500">Trainers</span></h2>
            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-2" />
            <p className="text-xs text-gray-400 mt-2">Showing {normPaged.length} of {trainers.length} trainers · Click a card to view full profile</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-amber-50 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {normPaged.map((t) => (
                <div key={t.id} className="bg-gradient-to-br from-amber-50 to-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer" onClick={() => setSelected(t)}>
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative flex-shrink-0">
                      <img src={t.image} alt={t.name} className="w-20 h-20 rounded-xl object-cover" onError={e => { e.currentTarget.src = fallbackImages[0]; }} />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${t.available ? "bg-emerald-500" : "bg-red-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-800 truncate">{t.name}</h3>
                      <p className="text-xs text-amber-500 font-medium">{t.role}</p>
                      <div className="flex items-center gap-1 mt-1"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /><span className="text-xs font-semibold text-gray-700">{t.rating}</span><span className="text-[10px] text-gray-400">· {t.clients} clients</span></div>
                      <div className="flex items-center gap-1 mt-1"><Clock className="w-3 h-3 text-amber-500" /><span className="text-[10px] text-gray-500">{t.experience}</span></div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="flex flex-wrap gap-1 mb-3">{t.specialties.slice(0, 2).map((s, i) => <span key={i} className="text-[9px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">{s}</span>)}</div>
                    <button disabled={!t.available} className={`w-full py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${t.available ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>{t.available ? "Book a Session" : "Currently Unavailable"}</button>
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

      {/* ── TRAINER DETAIL MODAL ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 hover:bg-amber-500 hover:text-white transition-all duration-300"><X className="w-5 h-5" /></button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 bg-gradient-to-br from-amber-500 to-orange-500 p-6 md:p-8 flex flex-col items-center justify-center">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = fallbackImages[0]; }} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mt-4 text-center">{selected.name}</h3>
                <p className="text-amber-100 text-sm mt-1">{selected.role}</p>
                <div className="flex gap-3 mt-4">{[FaFacebook, FaInstagram, FaTwitter].map((Icon, i) => <button key={i} onClick={e => openLink("https://example.com", e)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-amber-500 transition-all duration-300 text-white"><Icon className="w-4 h-4" /></button>)}</div>
              </div>
              <div className="md:w-3/5 p-5 md:p-8">
                <h4 className="text-base font-bold text-gray-800 mb-2">About Me</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{selected.bio}</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[{ icon: Award, label: "Experience", val: selected.experience }, { icon: Users, label: "Happy Clients", val: selected.clients }, { icon: Calendar, label: "Certification", val: selected.certification?.split(" ")[0] }, { icon: Star, label: "Rating", val: `${selected.rating} / 5.0` }].map((s, i) => (
                    <div key={i} className="flex items-center gap-2"><s.icon className="w-4 h-4 text-amber-500" /><div><p className="text-[10px] text-gray-500">{s.label}</p><p className="text-xs font-semibold text-gray-800">{s.val}</p></div></div>
                  ))}
                </div>
                <h4 className="text-base font-bold text-gray-800 mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2 mb-5">{selected.specialties.map((s, i) => <span key={i} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{s}</span>)}</div>
                <button disabled={!selected.available} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${selected.available ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>{selected.available ? `Book a Session with ${selected.name.split(" ")[0]}` : "Currently Unavailable"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}