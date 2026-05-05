"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { useAuth } from "@/context/AuthContext";
import { classAPI, trainerAPI, uploadAPI } from "@/lib/api";
import { confirmToast, showSuccess, showError } from "@/lib/toast";
import { Plus, Clock, Users, Edit2, Trash2, CalendarCheck, X, Check, RefreshCw, AlertCircle, ImagePlus, Loader2 } from "lucide-react";

const DAYS_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EMPTY_FORM = {
  name: "", trainer: "", trainerId: "", startTime: "06:00", endTime: "07:00",
  capacity: "", price: "", priceType: "included", days: [], description: "",
  level: "All Levels", intensity: "", calories: "", image: "",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://fitzone-backend-vis3.onrender.com";

const resolveImage = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_URL}/${img.replace(/^\//, "")}`;
};

export default function Page() {
  const { user } = useAuth();

  const [classes,       setClasses]       = useState([]);
  const [trainers,      setTrainers]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [showModal,     setShowModal]     = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [saving,        setSaving]        = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [imgUploading,  setImgUploading]  = useState(false);
  const [imgPreview,    setImgPreview]    = useState(null);
  const fileInputRef = useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleDay = (d) => setForm(p => ({ ...p, days: p.days.includes(d) ? p.days.filter(x => x !== d) : [...p.days, d] }));

  // ── Fetch classes & trainers from backend ──────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const [classRes, trainerRes] = await Promise.all([
        classAPI.getAll({ limit: 100 }),
        trainerAPI.getAll({ limit: 100, status: "Active" }),
      ]);
      setClasses(classRes.data || []);
      setTrainers(trainerRes.data || []);
    } catch (err) {
      // Don't show session errors — token refresh handles them silently
      if (!err.message?.includes("session") && !err.message?.includes("log in")) {
        setError(err.message || "Failed to load classes");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setImgPreview(null); setError(""); setShowModal(true); };
  const openEdit = (c) => {
    setEditId(c._id);
    setForm({
      name:        c.name,
      trainer:     c.trainerName || "",
      trainerId:   c.trainer?._id || c.trainer || "",
      startTime:   c.startTime || "06:00",
      endTime:     c.endTime   || "07:00",
      capacity:    String(c.capacity),
      price:       c.isPaid ? String(c.price) : "",
      priceType:   c.isPaid ? "paid" : "included",
      days:        c.days || [],
      description: c.description || "",
      level:       c.level || "All Levels",
      intensity:   c.intensity || "",
      calories:    c.calories || "",
      image:       c.image || "",
    });
    setImgPreview(resolveImage(c.image) || null);
    setError(""); setShowModal(true);
  };

  // ── Image upload handler ───────────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type only — no size limit
    if (!file.type.startsWith("image/")) {
      showError("Please select an image file.");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setImgUploading(true);
    try {
      const res = await uploadAPI.upload(file, "classes");
      set("image", res.data?.url || "");
      showSuccess("Image uploaded!");
    } catch (err) {
      showError(err.message || "Image upload failed");
      setImgPreview(null);
    } finally {
      setImgUploading(false);
    }
  };

  const removeImage = () => {
    set("image", "");
    setImgPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit (create or update) ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.trainerId || form.days.length === 0) {
      setError("Class name, trainer and at least one day are required.");
      return;
    }
    setSaving(true); setError("");

    const payload = {
      name:        form.name,
      trainer:     form.trainerId,
      trainerName: form.trainer,
      startTime:   form.startTime,
      endTime:     form.endTime,
      capacity:    Number(form.capacity) || 20,
      isPaid:      form.priceType === "paid",
      price:       form.priceType === "paid" ? Number(form.price) || 0 : 0,
      days:        form.days,
      description: form.description,
      level:       form.level,
      intensity:   form.intensity,
      calories:    form.calories,
      image:       form.image,
      status:      "Active",
    };

    try {
      if (editId) {
        const res = await classAPI.update(editId, payload);
        setClasses(p => p.map(c => c._id === editId ? res.data : c));
        showSuccess(`"${payload.name}" class updated!`);
      } else {
        const res = await classAPI.create(payload);
        setClasses(p => [res.data, ...p]);
        showSuccess(`"${payload.name}" class added!`);
      }
      setSaving(false); setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); }, 1400);
    } catch (err) {
      setError(err.message || "Failed to save class");
      showError(err.message || "Failed to save class");
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    const confirmed = await confirmToast(`Delete "${name}" class? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await classAPI.delete(id);
      setClasses(p => p.filter(c => c._id !== id));
      showSuccess(`"${name}" class deleted.`);
    } catch (err) {
      showError(err.message || "Failed to delete class");
    }
  };

  // ── Stats ──────────────────────────────────────────────────────
  const totalEnrolled = classes.reduce((s, c) => s + (c.enrolled || 0), 0);
  const avgOccupancy  = classes.length
    ? Math.round(classes.reduce((s, c) => s + ((c.enrolled || 0) / (c.capacity || 1)) * 100, 0) / classes.length)
    : 0;

  return (
    <RoleDashboardLayout title="Classes" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Class Schedule</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage classes, trainers and capacity</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors" title="Refresh">
              <RefreshCw size={15} className="text-[var(--muted)]" />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm">
              <Plus size={15} /> Add Class
            </button>
          </div>
        </div>

        {error && !showModal && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={15} />{error !== "session_expired" ? error : ""}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Classes",  value: classes.length },
            { label: "Active",         value: classes.filter(c => c.status === "Active").length },
            { label: "Total Enrolled", value: totalEnrolled },
            { label: "Avg Occupancy",  value: `${avgOccupancy}%` },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <CalendarCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No classes yet</p>
            <p className="text-sm mt-1">Click "Add Class" to schedule your first class</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {classes.map(c => {
              const pct = Math.round(((c.enrolled || 0) / (c.capacity || 1)) * 100);
              const trainerName = c.trainer?.name || c.trainerName || "—";
              const daysStr = Array.isArray(c.days) ? c.days.join(", ") : c.days || "";
              const timeStr = `${c.startTime || ""}–${c.endTime || ""}`;
              const priceStr = c.isPaid ? `₹${c.price}/class` : "Included";

              return (
              <div key={c._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {/* Class image — show fallback gradient if no image or load error */}
                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
                    {c.image ? (
                      <img
                        src={resolveImage(c.image)}
                        alt={c.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === "Active" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                      {c.status}
                    </span>
                    {!c.image && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CalendarCheck size={32} className="text-white/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--text)]">{c.name}</h3>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{trainerName}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Clock size={12} />{timeStr}</div>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><CalendarCheck size={12} />{daysStr}</div>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Users size={12} />{c.enrolled || 0}/{c.capacity} enrolled</div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                      <span>Capacity</span>
                      <span className={pct >= 90 ? "text-red-500 font-semibold" : "text-[var(--text)]"}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--surface2)] rounded-full">
                      <div className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-600"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600">{priceStr}</span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={13} className="text-blue-600" /></button>
                      <button onClick={() => handleDelete(c._id, c.name)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={13} className="text-red-500" /></button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{editId ? "Edit Class" : "Add New Class"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{editId ? "Update class details" : "Schedule a new class"}</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setImgPreview(null); setError(""); }} className="p-2 hover:bg-[var(--surface2)] rounded-lg">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-[var(--text)]">{editId ? "Class Updated!" : "Class Added!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name} has been {editId ? "updated" : "scheduled"} successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
                    <AlertCircle size={13} />{error}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Class Name <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Morning Yoga" value={form.name} onChange={e => set("name", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Trainer <span className="text-red-500">*</span></label>
                  <select required value={form.trainerId}
                    onChange={e => {
                      const t = trainers.find(t => t._id === e.target.value);
                      set("trainerId", e.target.value);
                      set("trainer", t?.name || "");
                    }}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Select trainer</option>
                    {trainers.map(t => <option key={t._id} value={t._id}>{t.name} — {t.specialty}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Days <span className="text-red-500">*</span></label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS_OPTIONS.map(d => (
                      <button key={d} type="button" onClick={() => toggleDay(d)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${form.days.includes(d) ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-[var(--border)] text-[var(--muted)] hover:border-blue-300"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Start Time</label>
                    <input type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">End Time</label>
                    <input type="time" value={form.endTime} onChange={e => set("endTime", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Max Capacity</label>
                  <input type="number" placeholder="20" min="1" max="200" value={form.capacity} onChange={e => set("capacity", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Pricing</label>
                  <div className="flex gap-3 mb-2">
                    {[{ v: "included", l: "Included in membership" }, { v: "paid", l: "Paid separately" }].map(opt => (
                      <button key={opt.v} type="button" onClick={() => set("priceType", opt.v)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.priceType === opt.v ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-[var(--border)] text-[var(--muted)] hover:border-blue-300"}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                  {form.priceType === "paid" && (
                    <input type="number" placeholder="299" min="1" value={form.price} onChange={e => set("price", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Description (optional)</label>
                  <textarea rows={2} placeholder="Brief description..." value={form.description} onChange={e => set("description", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                </div>

                {/* ── Image Upload ── */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Class Image (optional)</label>
                  {imgPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-[var(--border)] group">
                      <img src={imgPreview} alt="Class preview" className="w-full h-40 object-cover" />
                      {imgUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                      )}
                      {!imgUploading && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imgUploading}
                      className="w-full h-32 border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-[var(--muted)] disabled:opacity-50"
                    >
                      {imgUploading ? (
                        <Loader2 size={22} className="animate-spin text-blue-500" />
                      ) : (
                        <ImagePlus size={22} className="text-blue-400" />
                      )}
                      <span className="text-xs font-medium">
                        {imgUploading ? "Uploading..." : "Click to upload image"}
                      </span>
                      <span className="text-[10px] text-[var(--muted2)]">JPG, PNG, WEBP · Any size</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                {/* ── Extra fields: Level, Intensity, Calories ── */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Level</label>
                    <select value={form.level} onChange={e => set("level", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      {["All Levels","Beginner","Intermediate","Advanced","Expert"].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Intensity</label>
                    <input type="text" placeholder="e.g. High" value={form.intensity} onChange={e => set("intensity", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Calories</label>
                    <input type="text" placeholder="e.g. 400 cal" value={form.calories} onChange={e => set("calories", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setImgPreview(null); setError(""); }}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editId ? "Update Class" : "Add Class"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}
