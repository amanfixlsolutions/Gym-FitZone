"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { liveClassAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Video, Plus, Play, CheckCircle, XCircle, Users, Clock,
  Calendar, RefreshCw, X, Check, Edit2, Trash2, Eye,
  TrendingUp, DollarSign, ChevronDown, Zap,
} from "lucide-react";

const statusConfig = {
  scheduled:  { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",       label: "Scheduled" },
  live:       { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",           label: "🔴 Live" },
  completed:  { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Completed" },
  cancelled:  { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",          label: "Cancelled" },
  draft:      { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",   label: "Draft" },
};

const CATEGORIES = ["Yoga","HIIT","Zumba","Pilates","Strength","Cardio","Meditation","CrossFit","Other"];
const EMPTY_FORM = {
  title: "", description: "", category: "Yoga", scheduledAt: "", duration: 60,
  maxParticipants: 30, isFree: true, price: 0, trainerName: "",
};

// Format date for display in IST
const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric", 
    month: "short",
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true,
  });
};

// Convert UTC/ISO date to datetime-local input value in local browser timezone
const toLocalInput = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

// Convert UTC date from server to local datetime-local input value
const toLocalInput = (utcDateString) => {
  if (!utcDateString) return "";
  const date = new Date(utcDateString);
  // Get local time components directly
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Get current datetime in local timezone for datetime-local input
const getCurrentLocalDateTime = () => {
  const now = new Date();
  now.setHours(now.getHours() + 1); // Add 1 hour
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const fmtMoney = (v) => `₹${(v || 0).toLocaleString()}`;

export default function Page() {
  const [classes,   setClasses]   = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [viewClass, setViewClass] = useState(null);
  const [bookings,  setBookings]  = useState([]);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [actioning, setActioning] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [classRes, analyticsRes] = await Promise.all([
        liveClassAPI.getAll({ limit: 50 }),
        liveClassAPI.analytics(),
      ]);
      setClasses(classRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load live classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditClass(null);
    setForm({ 
      ...EMPTY_FORM, 
      scheduledAt: getCurrentLocalDateTime()
    });
    setShowModal(true);
  };

  const openEdit = (lc) => {
    setEditClass(lc);
    setForm({
      title:           lc.title,
      description:     lc.description || "",
      category:        lc.category || "Yoga",
      scheduledAt:     toLocalInput(lc.scheduledAt),
      duration:        lc.duration,
      maxParticipants: lc.maxParticipants,
      isFree:          lc.isFree,
      price:           lc.price || 0,
      trainerName:     lc.trainerName || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.scheduledAt) return;
    setSaving(true);
    try {
      // Parse the local datetime string to Date object
      const localDateTime = new Date(form.scheduledAt);
      // Send ISO string (will be UTC)
      const payload = { 
        ...form, 
        scheduledAt: localDateTime.toISOString(),
        price: form.isFree ? 0 : Number(form.price) 
      };
      if (editClass) {
        await liveClassAPI.update(editClass._id, payload);
        showSuccess("Class updated!");
      } else {
        await liveClassAPI.create(payload);
        showSuccess("Live class created with Zoom meeting!");
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowModal(false); fetchData(); }, 1200);
    } catch (err) {
      showError(err.message || "Failed to save class");
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async (lc) => {
    setActioning(lc._id + "_start");
    try {
      const res = await liveClassAPI.start(lc._id);
      showSuccess("Class is now LIVE!");
      if (res.startUrl) window.open(res.startUrl, "_blank");
      fetchData();
    } catch (err) { showError(err.message || "Failed to start"); }
    finally { setActioning(null); }
  };

  const handleComplete = async (lc) => {
    const confirmed = await confirmToast(`End "${lc.title}"? This will mark the class as completed and close the Zoom meeting.`);
    if (!confirmed) return;
    setActioning(lc._id + "_complete");
    try {
      await liveClassAPI.complete(lc._id);
      showSuccess("Class ended and marked as completed!");
      fetchData();
    } catch (err) { showError(err.message || "Failed to end class"); }
    finally { setActioning(null); }
  };

  const handleCancel = async (lc) => {
    const confirmed = await confirmToast(`Cancel "${lc.title}"? All bookings will be cancelled.`);
    if (!confirmed) return;
    setActioning(lc._id + "_cancel");
    try {
      await liveClassAPI.cancel(lc._id, "Cancelled by gym owner");
      showSuccess("Class cancelled.");
      fetchData();
    } catch (err) { showError(err.message || "Failed"); }
    finally { setActioning(null); }
  };

  const handleDelete = async (lc) => {
    const confirmed = await confirmToast(`Delete "${lc.title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await liveClassAPI.delete(lc._id);
      showSuccess("Class deleted.");
      fetchData();
    } catch (err) { showError(err.message || "Failed"); }
  };

  const openBookings = async (lc) => {
    setViewClass(lc);
    try {
      const res = await liveClassAPI.getBookings(lc._id, { limit: 50 });
      setBookings(res.data || []);
    } catch { setBookings([]); }
  };

  const filtered = classes.filter(c =>
    filterStatus === "All" || c.status === filterStatus
  );

  return (
    <RoleDashboardLayout title="Live Classes" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Live Classes</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Zoom-powered live sessions for your members</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm cursor-pointer">
              <Plus size={15} /> Create Live Class
            </button>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Classes",   value: analytics?.totalClasses    || 0, icon: Video },
            { label: "Total Bookings",  value: analytics?.totalBookings   || 0, icon: Users },
            { label: "Completed",       value: analytics?.completedClasses || 0, icon: CheckCircle },
            { label: "Revenue",         value: fmtMoney(analytics?.totalRevenue), icon: DollarSign },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                {loading ? <div className="h-6 bg-[var(--surface2)] rounded animate-pulse w-12" /> : <p className="text-xl font-bold text-[var(--text)]">{s.value}</p>}
                <s.icon size={16} className="text-[var(--muted2)]" />
              </div>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["All", "scheduled", "live", "completed", "cancelled"].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize ${
                filterStatus === f ? "bg-blue-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
              }`}>{f === "All" ? "All" : statusConfig[f]?.label || f}</button>
          ))}
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
            <Video size={40} className="text-[var(--muted2)] mx-auto mb-3" />
            <p className="font-semibold text-[var(--text)]">No live classes yet</p>
            <p className="text-sm text-[var(--muted)] mt-1">Create your first Zoom live class</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(lc => {
              const sc = statusConfig[lc.status] || statusConfig.draft;
              const isActing = actioning?.startsWith(lc._id);
              return (
                <div key={lc._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video size={16} className="text-white" />
                      <span className="text-white text-xs font-semibold">{lc.category}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.cls}`}>{sc.label}</span>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-[var(--text)] leading-tight">{lc.title}</h3>

                    <div className="space-y-1 text-xs text-[var(--muted)]">
                      <div className="flex items-center gap-1.5"><Calendar size={12} /> {fmtDate(lc.scheduledAt)}</div>
                      <div className="flex items-center gap-1.5"><Clock size={12} /> {lc.duration} min</div>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} />
                        {lc.confirmedBookings || lc.enrolledCount || 0} / {lc.maxParticipants} booked
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={12} />
                        {lc.isFree ? "Free" : fmtMoney(lc.price)}
                      </div>
                    </div>

                    {/* Zoom link status — only for active classes */}
                    {(lc.status === "scheduled" || lc.status === "live") && (
                      lc.zoomJoinUrl ? (
                        <div className={`rounded-lg px-3 py-1.5 flex items-center justify-between ${
                          lc.status === "live"
                            ? "bg-red-50 dark:bg-red-900/20"
                            : "bg-blue-50 dark:bg-blue-900/20"
                        }`}>
                          <p className={`text-[10px] font-semibold ${lc.status === "live" ? "text-red-600" : "text-blue-600"}`}>
                            {lc.status === "live" ? "🔴 Class is LIVE" : "✅ Zoom meeting ready"}
                          </p>
                          <a
                            href={lc.zoomStartUrl || lc.zoomJoinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[10px] font-bold hover:underline ${lc.status === "live" ? "text-red-700" : "text-blue-700"}`}
                          >
                            {lc.status === "live" ? "Host →" : "Start →"}
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            setActioning(lc._id + "_zoom");
                            try {
                              await liveClassAPI.regenerateZoom(lc._id);
                              showSuccess("Zoom link generated!");
                              fetchData();
                            } catch (err) {
                              showError(err.message || "Failed to generate Zoom link");
                            } finally {
                              setActioning(null);
                            }
                          }}
                          disabled={actioning === lc._id + "_zoom"}
                          className="w-full py-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                        >
                          {actioning === lc._id + "_zoom"
                            ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                            : <Video size={11} />
                          }
                          Generate Zoom Link
                        </button>
                      )
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      {lc.status === "scheduled" && (
                        <button onClick={() => handleStart(lc)} disabled={isActing}
                          className="flex-1 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60">
                          {isActing ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={12} />}
                          Go Live
                        </button>
                      )}
                      {lc.status === "live" && (
                        <button onClick={() => handleComplete(lc)} disabled={isActing}
                          className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60">
                          {isActing ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={12} />}
                          End Class
                        </button>
                      )}
                      <button onClick={() => openBookings(lc)}
                        className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 cursor-pointer" title="View bookings">
                        <Eye size={14} />
                      </button>
                      {(lc.status === "scheduled" || lc.status === "draft") && (
                        <button onClick={() => openEdit(lc)}
                          className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 cursor-pointer" title="Edit">
                          <Edit2 size={14} />
                        </button>
                      )}
                      {(lc.status === "scheduled" || lc.status === "draft") && (
                        <button onClick={() => handleCancel(lc)} disabled={isActing}
                          className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 cursor-pointer" title="Cancel">
                          <XCircle size={14} />
                        </button>
                      )}
                      {(lc.status === "cancelled" || lc.status === "completed") && (
                        <button onClick={() => handleDelete(lc)}
                          className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 cursor-pointer" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{editClass ? "Edit Live Class" : "Create Live Class"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">A Zoom meeting will be auto-created</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-[var(--text)]">{editClass ? "Class Updated!" : "Live Class Created!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">Zoom meeting has been set up automatically.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Class Title <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Morning Yoga Flow" value={form.title} onChange={e => set("title", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Category</label>
                    <div className="relative">
                      <select value={form.category} onChange={e => set("category", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Trainer Name</label>
                    <input type="text" placeholder="Optional" value={form.trainerName} onChange={e => set("trainerName", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Scheduled Date & Time <span className="text-red-500">*</span></label>
                  <input required type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <p className="text-[10px] text-[var(--muted2)] mt-1">Time will be in your local timezone (IST)</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Duration (minutes)</label>
                    <input type="number" min="15" max="240" value={form.duration} onChange={e => set("duration", Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Max Participants</label>
                    <input type="number" min="1" max="500" value={form.maxParticipants} onChange={e => set("maxParticipants", Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Pricing</label>
                  <div className="flex gap-3">
                    {[{ v: true, l: "Free" }, { v: false, l: "Paid" }].map(opt => (
                      <button key={String(opt.v)} type="button" onClick={() => set("isFree", opt.v)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer ${
                          form.isFree === opt.v ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-[var(--border)] text-[var(--muted)] hover:border-blue-300"
                        }`}>{opt.l}</button>
                    ))}
                  </div>
                  {!form.isFree && (
                    <div className="mt-2">
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Price (₹)</label>
                      <input type="number" min="1" placeholder="e.g. 299" value={form.price} onChange={e => set("price", Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Description</label>
                  <textarea rows={2} placeholder="What will members learn in this class?" value={form.description} onChange={e => set("description", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm cursor-pointer">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={15} />}
                    {saving ? "Creating..." : editClass ? "Update Class" : "Create + Zoom"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── BOOKINGS MODAL ── */}
      {viewClass && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">Bookings</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{viewClass.title}</p>
              </div>
              <button onClick={() => setViewClass(null)} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {bookings.length === 0 ? (
                <p className="text-center text-sm text-[var(--muted)] py-6">No bookings yet</p>
              ) : bookings.map(b => (
                <div key={b._id} className="flex items-center justify-between p-3 bg-[var(--surface2)] rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{b.memberName}</p>
                    <p className="text-xs text-[var(--muted)]">{b.memberEmail}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.attendanceStatus === "completed" ? "bg-emerald-100 text-emerald-700" :
                      b.attendanceStatus === "joined"    ? "bg-blue-100 text-blue-700" :
                      b.attendanceStatus === "absent"    ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>{b.attendanceStatus}</span>
                    <p className="text-[10px] text-[var(--muted)] mt-0.5">
                      {b.paymentStatus === "free" ? "Free" : `₹${b.paymentAmount}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}