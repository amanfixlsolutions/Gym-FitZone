"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { liveClassAPI } from "@/lib/api";
import {
  Video, Clock, Users, Calendar, Loader2, X,
  CheckCircle, CreditCard, ArrowRight, RefreshCw, AlertCircle,
} from "lucide-react";

// Load Razorpay script
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
    hour12: true,
  });
};

const CATEGORY_COLORS = {
  Yoga:       "from-purple-500 to-violet-600",
  HIIT:       "from-red-500 to-orange-500",
  Zumba:      "from-pink-500 to-rose-500",
  Pilates:    "from-teal-500 to-cyan-500",
  Strength:   "from-blue-500 to-indigo-600",
  Cardio:     "from-orange-500 to-amber-500",
  Meditation: "from-emerald-500 to-teal-500",
  CrossFit:   "from-red-600 to-rose-600",
  Other:      "from-gray-500 to-slate-600",
};

export default function LiveClassesPage() {
  const { user, loaded } = useAuth();
  const router = useRouter();

  const [classes,    setClasses]    = useState([]);
  const [myBookings, setMyBookings] = useState([]); // user's confirmed bookings
  const [loading,    setLoading]    = useState(true);
  const [booking,    setBooking]    = useState(null);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(null);
  const [filter,     setFilter]     = useState("all"); // all | live | free | paid | mine

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await liveClassAPI.getUpcoming({ limit: 20 });
      setClasses(res.data || []);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's bookings
  const fetchMyBookings = useCallback(async () => {
    if (!user) return;
    try {
      const res = await liveClassAPI.history({ limit: 50 });
      setMyBookings(res.data?.bookings || []);
    } catch {
      setMyBookings([]);
    }
  }, [user]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  useEffect(() => { fetchMyBookings(); }, [fetchMyBookings]);

  // ── Book a class (free or paid) ────────────────────────────────
  const handleBook = async (lc) => {
    setError("");

    if (!loaded || !user) {
      router.push("/login");
      return;
    }

    setBooking(lc._id);

    try {
      // ── Free class — direct book then get join link ────────────
      if (lc.isFree || lc.price === 0) {
        const res = await liveClassAPI.book(lc._id);

        // Handle already booked
        if (res.alreadyBooked) {
          let joinUrl = null;
          if (lc.status === "live") {
            try { const j = await liveClassAPI.join(lc._id); joinUrl = j.joinUrl; } catch {}
          }
          setSuccess({ title: lc.title, joinUrl, isFree: true, isLive: lc.status === "live" });
          fetchClasses();
          return;
        }

        // Now call /join to get the Zoom link (only if class is live)
        let joinUrl = null;
        if (lc.status === "live") {
          try {
            const joinRes = await liveClassAPI.join(lc._id);
            joinUrl = joinRes.joinUrl;
          } catch { /* class not live yet */ }
        }

        setSuccess({
          title:   lc.title,
          joinUrl,
          isFree:  true,
          isLive:  lc.status === "live",
        });
        fetchClasses();
        return;
      }

      // ── Paid class — Razorpay ──────────────────────────────────
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        setError("Failed to load payment gateway. Please try again.");
        return;
      }

      const orderRes = await liveClassAPI.book(lc._id);

      // Already confirmed booking
      if (orderRes.alreadyBooked) {
        let joinUrl = null;
        if (lc.status === "live") {
          try { const j = await liveClassAPI.join(lc._id); joinUrl = j.joinUrl; } catch {}
        }
        setSuccess({ title: lc.title, joinUrl, isFree: false, isLive: lc.status === "live" });
        fetchClasses();
        return;
      }

      if (!orderRes.requiresPayment) {
        // Booked without payment (shouldn't happen for paid, but handle gracefully)
        let joinUrl = null;
        if (lc.status === "live") {
          try { const j = await liveClassAPI.join(lc._id); joinUrl = j.joinUrl; } catch {}
        }
        setSuccess({ title: lc.title, joinUrl, isFree: false, isLive: lc.status === "live" });
        fetchClasses();
        return;
      }

      const { orderId, amount, currency, keyId, classTitle } = orderRes;

      const options = {
        key:         keyId,
        amount,
        currency,
        name:        "FitZone",
        description: classTitle || lc.title,
        order_id:    orderId,
        prefill: {
          name:    user.name,
          email:   user.email,
          contact: user.phone || "",
        },
        theme: { color: "#f59e0b" },
        handler: async (response) => {
          try {
            const verifyRes = await liveClassAPI.verifyPayment(lc._id, {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            // Get Zoom link if class is live
            let joinUrl = verifyRes.joinUrl || null;
            if (!joinUrl && lc.status === "live") {
              try {
                const joinRes = await liveClassAPI.join(lc._id);
                joinUrl = joinRes.joinUrl;
              } catch { /* silent */ }
            }

            setSuccess({
              title:   lc.title,
              joinUrl,
              isFree:  false,
              isLive:  lc.status === "live",
            });
            fetchClasses();
          } catch (err) {
            setError(err.message || "Payment verification failed.");
          } finally {
            setBooking(null);
          }
        },
        modal: {
          ondismiss: () => setBooking(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        setError(r.error?.description || "Payment failed.");
        setBooking(null);
      });
      rzp.open();

    } catch (err) {
      setError(err.message || "Failed to book class.");
      setBooking(null);
    }
  };

  // ── Filter classes ─────────────────────────────────────────────
  const filtered = classes.filter(lc => {
    if (filter === "live") return lc.status === "live";
    if (filter === "free") return lc.isFree || lc.price === 0;
    if (filter === "paid") return !lc.isFree && lc.price > 0;
    return true;
  });

  return (
    <div className="min-h-screen pb-12 relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/72 pointer-events-none" />

      {/* Content — needs relative + z-10 to sit above overlay */}
      <div className="relative z-10 pt-24 pb-12">

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-gray-800 mb-2">
              {success.isFree ? "Class Booked! 🎉" : "Payment Successful! 🎉"}
            </h2>
            <p className="text-gray-600 text-sm mb-4">{success.title}</p>

            {success.joinUrl ? (
              <a
                href={success.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all mb-3 flex items-center justify-center gap-2"
              >
                <Video size={16} /> Join Zoom Now →
              </a>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3">
                <p className="text-xs text-amber-700 font-medium">
                  {success.isLive
                    ? "Zoom link not available yet. Please try joining from the class page."
                    : "✅ Booking confirmed! Zoom link will be available when the class goes live."
                  }
                </p>
              </div>
            )}

            <button
              onClick={() => setSuccess(null)}
              className="w-full py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Video className="w-4 h-4 text-white" />
            <span className="text-white font-semibold text-sm uppercase tracking-wide">Live Classes</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Upcoming <span className="text-amber-400">Live Classes</span>
          </h1>
          <p className="text-white/70 text-sm">Join expert-led Zoom sessions from anywhere</p>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-lg mx-auto mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
            <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          {[
            { key: "all",  label: "All Classes" },
            { key: "live", label: "🔴 Live Now" },
            { key: "free", label: "Free" },
            { key: "paid", label: "Paid" },
            ...(user ? [{ key: "mine", label: `My Bookings ${myBookings.filter(b => b.bookingStatus === "confirmed").length > 0 ? `(${myBookings.filter(b => b.bookingStatus === "confirmed").length})` : ""}` }] : []),
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === f.key
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
              }`}>
              {f.label}
            </button>
          ))}
          <button onClick={() => { fetchClasses(); fetchMyBookings(); }} className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* My Bookings Tab */}
        {filter === "mine" && user && (
          <div className="space-y-3 mb-6">
            {myBookings.filter(b => b.bookingStatus === "confirmed").length === 0 ? (
              <div className="text-center py-12">
                <Video size={40} className="text-white/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm">No bookings yet.</p>
                <button onClick={() => setFilter("all")} className="mt-3 text-amber-400 text-sm font-semibold hover:underline">
                  Browse classes →
                </button>
              </div>
            ) : (
              myBookings.filter(b => b.bookingStatus === "confirmed").map(b => {
                const lc = b.liveClass;
                if (!lc) return null;
                const isLive = lc.status === "live";
                const color = CATEGORY_COLORS[lc.category] || CATEGORY_COLORS.Other;
                return (
                  <div key={b._id} className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl">
                    <div className={`bg-gradient-to-r ${color} px-4 py-2.5 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <Video size={14} className="text-white" />
                        <span className="text-white text-xs font-bold">{lc.category || "Live Class"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLive && <span className="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full animate-pulse">🔴 LIVE</span>}
                        <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                          {b.paymentStatus === "free" ? "Free" : `₹${b.paymentAmount}`}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">{lc.title || b.classTitle}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(lc.scheduledAt)}</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{lc.duration} min</span>
                        </div>
                        <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.attendanceStatus === "completed" ? "bg-emerald-100 text-emerald-700" :
                          b.attendanceStatus === "joined"    ? "bg-blue-100 text-blue-700" :
                          isLive ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                        }`}>
                          {b.attendanceStatus === "completed" ? "✓ Attended" :
                           b.attendanceStatus === "joined"    ? "Joined" :
                           isLive ? "🔴 Live Now" : "Upcoming"}
                        </span>
                      </div>
                      {/* Join button — only for live classes */}
                      {isLive ? (
                        <button
                          onClick={async () => {
                            try {
                              const res = await liveClassAPI.join(lc._id);
                              if (res.joinUrl) window.open(res.joinUrl, "_blank");
                              else setError("Zoom link not available yet.");
                            } catch (err) {
                              setError(err.message || "Failed to get Zoom link.");
                            }
                          }}
                          className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5"
                        >
                          <Video size={13} /> Join Zoom
                        </button>
                      ) : lc.status === "scheduled" ? (
                        <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-xl">
                          Starts soon
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Classes Grid — hidden when My Bookings tab is active */}
        {filter !== "mine" && (loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Video size={48} className="text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-sm">No upcoming live classes right now.</p>
            <p className="text-white/40 text-xs mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(lc => {
              const isLive = lc.status === "live";
              const color  = CATEGORY_COLORS[lc.category] || CATEGORY_COLORS.Other;
              const spotsLeft = lc.maxParticipants - (lc.enrolledCount || 0);
              const isFull = spotsLeft <= 0;

              return (
                <div key={lc._id} className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
                  {/* Banner */}
                  <div className={`bg-gradient-to-r ${color} px-4 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Video size={15} className="text-white" />
                      <span className="text-white text-xs font-bold">{lc.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLive && (
                        <span className="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full animate-pulse">
                          🔴 LIVE
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lc.isFree || lc.price === 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {lc.isFree || lc.price === 0 ? "Free" : `₹${lc.price}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-base mb-1 leading-tight">{lc.title}</h3>
                    {lc.trainerName && (
                      <p className="text-xs text-gray-500 mb-2">👤 {lc.trainerName}</p>
                    )}

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Calendar size={12} className="text-amber-500" />
                        {fmtDate(lc.scheduledAt)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock size={12} className="text-amber-500" />
                        {lc.duration} minutes
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Users size={12} className="text-amber-500" />
                        {lc.enrolledCount || 0}/{lc.maxParticipants} enrolled
                        {isFull && <span className="text-red-500 font-semibold ml-1">· Full</span>}
                        {!isFull && spotsLeft <= 5 && (
                          <span className="text-amber-600 font-semibold ml-1">· {spotsLeft} left</span>
                        )}
                      </div>
                    </div>

                    {lc.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{lc.description}</p>
                    )}

                    {/* Action button */}
                    {isLive && lc.zoomJoinUrl ? (
                      // Class is live — show Join Now directly
                      <a
                        href={lc.zoomJoinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold rounded-xl text-center hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Video size={14} /> Join Live Now →
                      </a>
                    ) : isFull ? (
                      <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 text-sm font-semibold rounded-xl cursor-not-allowed">
                        Class Full
                      </button>
                    ) : !user ? (
                      <button
                        onClick={() => router.push("/login")}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowRight size={14} /> Login to Book
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBook(lc)}
                        disabled={booking === lc._id}
                        className={`w-full py-2.5 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${
                          lc.isFree || lc.price === 0
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : "bg-gradient-to-r from-amber-500 to-orange-500"
                        }`}
                      >
                        {booking === lc._id ? (
                          <><Loader2 size={14} className="animate-spin" /> Processing...</>
                        ) : lc.isFree || lc.price === 0 ? (
                          <><CheckCircle size={14} /> Book Free</>
                        ) : (
                          <><CreditCard size={14} /> Pay ₹{lc.price} & Book</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      <style>{`.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}`}</style>
        </div>
      </div>
    </div>
  );
}
