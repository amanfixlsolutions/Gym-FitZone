"use client";
import { useState, useEffect } from "react";
import { Video, Clock, Users, Calendar, Loader2, X, ExternalLink } from "lucide-react";
import { liveClassAPI } from "@/lib/api";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const STATUS_STYLE = {
  live:      "bg-red-100 text-red-600 animate-pulse",
  scheduled: "bg-blue-100 text-blue-600",
  completed: "bg-emerald-100 text-emerald-600",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function LiveClassesPage() {
  const [classes,  setClasses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await liveClassAPI.getUpcoming({ limit: 20 });
        setClasses(res.data || []);
      } catch {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80')",
          backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
        }}>
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-600/80 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Video size={16} className="text-white" />
            <span className="text-white font-semibold text-sm">Live Classes</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Upcoming Live Classes</h1>
          <p className="text-white/60 text-sm">Join Zoom-powered fitness sessions from anywhere</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center">
            <Video size={40} className="text-white/30 mx-auto mb-3" />
            <p className="text-white font-semibold">No upcoming live classes</p>
            <p className="text-white/50 text-sm mt-1">Check back soon for new sessions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map(lc => (
              <div key={lc._id}
                className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => setSelected(lc)}
              >
                {/* Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video size={15} className="text-white" />
                    <span className="text-white text-xs font-semibold">{lc.category}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[lc.status] || STATUS_STYLE.scheduled}`}>
                    {lc.status === "live" ? "🔴 LIVE NOW" : "Scheduled"}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-gray-800 text-base">{lc.title}</h3>
                  {lc.description && <p className="text-xs text-gray-500 line-clamp-2">{lc.description}</p>}

                  <div className="space-y-1 text-xs text-gray-500 pt-1">
                    <div className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500" /> {fmtDate(lc.scheduledAt)}</div>
                    <div className="flex items-center gap-1.5"><Clock size={12} className="text-blue-500" /> {lc.duration} min</div>
                    <div className="flex items-center gap-1.5"><Users size={12} className="text-blue-500" /> {lc.enrolledCount || 0} / {lc.maxParticipants} booked</div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${lc.isFree ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {lc.isFree ? "Free" : `₹${lc.price}`}
                    </span>
                    {lc.status === "live" && lc.zoomJoinUrl ? (
                      <a href={lc.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
                        <Video size={12} /> Join Now
                      </a>
                    ) : (
                      <button className="text-xs text-blue-600 font-semibold hover:underline">View Details →</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-white" />
                <span className="text-white font-bold">{selected.category}</span>
              </div>
              <button onClick={() => setSelected(null)} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <X size={14} className="text-white" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-xl font-black text-gray-800">{selected.title}</h2>
                {selected.description && <p className="text-sm text-gray-500 mt-1">{selected.description}</p>}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                {[
                  { icon: Calendar, label: "Date & Time", value: fmtDate(selected.scheduledAt) },
                  { icon: Clock,    label: "Duration",    value: `${selected.duration} minutes` },
                  { icon: Users,    label: "Capacity",    value: `${selected.enrolledCount || 0} / ${selected.maxParticipants} booked` },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-medium text-gray-800">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${selected.isFree ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {selected.isFree ? "Free Class" : `₹${selected.price} / session`}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[selected.status] || STATUS_STYLE.scheduled}`}>
                  {selected.status === "live" ? "🔴 LIVE NOW" : "Scheduled"}
                </span>
              </div>

              {selected.status === "live" && selected.zoomJoinUrl ? (
                <a href={selected.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-3 bg-red-600 text-white text-sm font-bold rounded-xl text-center hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                  <Video size={16} /> Join Live Class Now
                </a>
              ) : selected.zoomJoinUrl ? (
                <a href={selected.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl text-center hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <ExternalLink size={16} /> Open Zoom Link
                </a>
              ) : (
                <div className="w-full py-3 bg-gray-100 text-gray-400 text-sm font-semibold rounded-xl text-center">
                  Zoom link will be available when class starts
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
