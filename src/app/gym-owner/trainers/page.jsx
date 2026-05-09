"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { useAuth } from "@/context/AuthContext";
import { trainerAPI, uploadAPI } from "@/lib/api";
import { confirmToast, showSuccess, showError } from "@/lib/toast";
import { Plus, Star, X, Check, RefreshCw, AlertCircle, Camera, Upload, User } from "lucide-react";

const SPECIALTIES = [
  "Strength & HIIT", "Yoga & Meditation", "Bodybuilding", "Zumba & Dance",
  "CrossFit", "Pilates", "Cardio & Endurance", "Nutrition & Diet", "Personal Training",
  "Boxing & Kickboxing", "Swimming", "Cycling",
];
const COLORS = [
  "from-blue-500 to-blue-700", "from-purple-500 to-purple-700",
  "from-emerald-500 to-emerald-700", "from-pink-500 to-pink-700",
  "from-amber-500 to-amber-700", "from-teal-500 to-teal-700",
];
const EMPTY_FORM = {
  name: "", specialty: "", phone: "", email: "",
  experience: "", cert: "", bio: "", salary: "",
  photo: "", photoPreview: "",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://fitzone-backend-vis3.onrender.com";

// Resolve image URL — handles both Cloudinary URLs and local paths
const resolvePhoto = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("http")) return photo;
  return `${API_BASE}${photo}`;
};

export default function Page() {
  const { user } = useAuth();

  const [trainers,   setTrainers]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [viewTrainer, setViewTrainer] = useState(null); // profile view
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [success,    setSuccess]    = useState(false);
  const fileInputRef = useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Fetch trainers ─────────────────────────────────────────────
  const fetchTrainers = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const res = await trainerAPI.getAll({ limit: 100 });
      setTrainers(res.data || []);
    } catch (err) {
      if (!err.message?.includes("session") && !err.message?.includes("log in") && !err.message?.includes("authorized")) {
        setError(err.message || "Failed to load trainers");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrainers(); }, [fetchTrainers]);

  const openAdd = () => {
    setEditId(null); setForm(EMPTY_FORM); setError(""); setShowModal(true);
  };
  const openEdit = (t) => {
    setEditId(t._id);
    setForm({
      name:         t.name,
      specialty:    t.specialty,
      phone:        t.phone,
      email:        t.email || "",
      experience:   t.experience || "",
      cert:         t.certification || "",
      bio:          t.bio || "",
      salary:       t.salary ? String(t.salary) : "",
      photo:        t.photo || "",
      photoPreview: t.photo ? resolvePhoto(t.photo) : "",
    });
    setError(""); setShowModal(true);
  };

  // ── Handle photo file selection ────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => set("photoPreview", ev.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setUploading(true); setError("");
    try {
      const res = await uploadAPI.upload(file, "trainers");
      set("photo", res.data.url);
      set("photoPreview", resolvePhoto(res.data.url));
    } catch (err) {
      setError("Photo upload failed: " + (err.message || "Try again"));
      set("photoPreview", "");
    } finally {
      setUploading(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialty || !form.phone) return;
    if (uploading) { setError("Please wait for photo upload to complete."); return; }
    setSaving(true); setError("");

    const payload = {
      name:          form.name,
      specialty:     form.specialty,
      phone:         form.phone,
      email:         form.email,
      experience:    form.experience,
      certification: form.cert,
      bio:           form.bio,
      salary:        form.salary ? parseFloat(form.salary) : 0,
      photo:         form.photo || "",
    };

    try {
      if (editId) {
        const res = await trainerAPI.update(editId, payload);
        setTrainers(p => p.map(t => t._id === editId ? res.data : t));
        showSuccess(`${payload.name} updated successfully!`);
      } else {
        const res = await trainerAPI.create(payload);
        setTrainers(p => [res.data, ...p]);
        showSuccess(`${payload.name} added as trainer!`);
      }
      setSaving(false); setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); }, 1400);
    } catch (err) {
      setError(err.message || "Failed to save trainer");
      showError(err.message || "Failed to save trainer");
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    const confirmed = await confirmToast(`Remove "${name}" from trainers?`);
    if (!confirmed) return;
    try {
      await trainerAPI.delete(id);
      setTrainers(p => p.filter(t => t._id !== id));
      showSuccess(`${name} removed.`);
    } catch (err) {
      showError(err.message || "Failed to delete trainer");
    }
  };

  const stats = {
    total:     trainers.length,
    active:    trainers.filter(t => t.status === "Active").length,
    onLeave:   trainers.filter(t => t.status === "On Leave").length,
    avgRating: trainers.filter(t => t.rating > 0).length
      ? (trainers.filter(t => t.rating > 0).reduce((s, t) => s + t.rating, 0) / trainers.filter(t => t.rating > 0).length).toFixed(1)
      : "—",
  };

  return (
    <RoleDashboardLayout title="Trainers" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Trainers</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage your gym's certified trainers</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchTrainers} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors" title="Refresh">
              <RefreshCw size={15} className="text-[var(--muted)]" />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm">
              <Plus size={15} /> Add Trainer
            </button>
          </div>
        </div>

        {error && !showModal && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={15} />{error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Trainers", value: stats.total },
            { label: "Active",         value: stats.active },
            { label: "On Leave",       value: stats.onLeave },
            { label: "Avg Rating",     value: stats.avgRating === "—" ? "—" : `${stats.avgRating}★` },
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
        ) : trainers.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <User size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No trainers yet</p>
            <p className="text-sm mt-1">Click "Add Trainer" to register your first trainer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {trainers.map((t, idx) => {
              const initials = t.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
              const color    = COLORS[idx % COLORS.length];
              const photoUrl = resolvePhoto(t.photo);

              return (
                <div
                  key={t._id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setViewTrainer(t)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Photo or initials */}
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={t.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-[var(--border)]"
                          onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                        />
                      ) : null}
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${photoUrl ? "hidden" : "flex"}`}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)]">{t.name}</p>
                        <p className="text-xs text-[var(--muted)]">{t.specialty}</p>
                        {t.certification && <p className="text-[10px] text-blue-600 font-medium mt-0.5">{t.certification}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-[var(--surface2)] rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1">
                        {t.rating > 0
                          ? <><Star size={11} className="text-amber-400 fill-amber-400" /><p className="text-sm font-bold text-[var(--text)]">{t.rating}</p></>
                          : <p className="text-sm font-bold text-[var(--muted)]">—</p>
                        }
                      </div>
                      <p className="text-[10px] text-[var(--muted)]">Rating</p>
                    </div>
                    <div className="bg-[var(--surface2)] rounded-lg p-2">
                      <p className="text-sm font-bold text-[var(--text)]">{t.totalSessions ?? 0}</p>
                      <p className="text-[10px] text-[var(--muted)]">Sessions</p>
                    </div>
                    <div className="bg-[var(--surface2)] rounded-lg p-2">
                      <p className="text-sm font-bold text-[var(--text)]">{t.totalClients ?? 0}</p>
                      <p className="text-[10px] text-[var(--muted)]">Clients</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {t.status}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(t); }} className="text-xs text-blue-600 font-medium hover:text-blue-700 px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(t._id, t.name); }} className="text-xs text-red-500 font-medium hover:text-red-600 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TRAINER PROFILE MODAL ── */}
      {viewTrainer && (() => {
        const t = viewTrainer;
        const photoUrl = resolvePhoto(t.photo);
        const initials = t.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
        const colorIdx = trainers.findIndex(tr => tr._id === t._id);
        const color = COLORS[colorIdx % COLORS.length] || COLORS[0];

        return (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setViewTrainer(null)}
          >
            <div
              className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* ── Header banner ── */}
              <div className={`bg-gradient-to-r ${color} p-6 relative`}>
                <button
                  onClick={() => setViewTrainer(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-5">
                  {/* Photo */}
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={t.name}
                      className="w-20 h-20 rounded-2xl object-cover border-3 border-white/50 shadow-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-xl font-black text-white">{t.name}</h2>
                    <p className="text-white/80 text-sm mt-0.5">{t.specialty}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.status === "Active" ? "bg-emerald-400/30 text-white" : "bg-amber-400/30 text-white"}`}>
                        {t.status}
                      </span>
                      {t.certification && (
                        <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">
                          {t.certification}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Stats row ── */}
              <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-b border-[var(--border)]">
                {[
                  { label: "Rating",   value: t.rating > 0 ? `${t.rating}★` : "—" },
                  { label: "Sessions", value: t.totalSessions ?? 0 },
                  { label: "Clients",  value: t.totalClients ?? 0 },
                ].map(s => (
                  <div key={s.label} className="py-4 text-center">
                    <p className="text-xl font-black text-[var(--text)]">{s.value}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* ── Details ── */}
              <div className="p-6 space-y-5">

                {/* Bio */}
                {t.bio && (
                  <div>
                    <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">About</h3>
                    <p className="text-sm text-[var(--text)] leading-relaxed">{t.bio}</p>
                  </div>
                )}

                {/* Info grid */}
                <div>
                  <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-3">Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Specialty",     value: t.specialty },
                      { label: "Experience",    value: t.experience || "—" },
                      { label: "Certification", value: t.certification || "—" },
                      { label: "Phone",         value: t.phone || "—" },
                      { label: "Email",         value: t.email || "—" },
                      { label: "Monthly Salary",value: t.salary ? `₹${Number(t.salary).toLocaleString()}` : "—" },
                    ].map(f => (
                      <div key={f.label} className="bg-[var(--surface2)] rounded-xl px-4 py-3">
                        <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">{f.label}</p>
                        <p className="text-sm font-medium text-[var(--text)] mt-0.5 truncate">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Joined date */}
                {t.createdAt && (
                  <p className="text-xs text-[var(--muted2)] text-center">
                    Joined {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setViewTrainer(null); openEdit(t); }}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => { setViewTrainer(null); handleDelete(t._id); }}
                    className="px-4 py-2.5 border border-red-200 text-red-500 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{editId ? "Edit Trainer" : "Add New Trainer"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{editId ? "Update trainer details" : "Register a new trainer"}</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setError(""); }} className="p-2 hover:bg-[var(--surface2)] rounded-lg">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-[var(--text)]">{editId ? "Trainer Updated!" : "Trainer Added!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name} has been {editId ? "updated" : "registered"} successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
                    <AlertCircle size={13} />{error}
                  </div>
                )}

                {/* ── Photo Upload ── */}
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Trainer Photo</p>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="relative flex-shrink-0">
                      {form.photoPreview ? (
                        <img
                          src={form.photoPreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-[var(--border)]"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-[var(--surface2)] border-2 border-dashed border-[var(--border)] flex items-center justify-center">
                          <User size={28} className="text-[var(--muted2)]" />
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                      {form.photoPreview && !uploading && (
                        <button
                          type="button"
                          onClick={() => { set("photo", ""); set("photoPreview", ""); }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>

                    {/* Upload button */}
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[var(--border)] rounded-xl text-sm text-[var(--muted)] hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all disabled:opacity-50 w-full justify-center"
                      >
                        {uploading ? (
                          <><span className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload size={15} /> {form.photoPreview ? "Change Photo" : "Upload Photo"}</>
                        )}
                      </button>
                      <p className="text-[10px] text-[var(--muted2)] mt-1.5 text-center">JPG, PNG, WebP · Max 5MB</p>
                    </div>
                  </div>
                </div>

                {/* ── Personal Details ── */}
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Personal Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input required type="text" placeholder="e.g. Arjun Kapoor" value={form.name} onChange={e => set("name", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Phone <span className="text-red-500">*</span></label>
                      <input required type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Email</label>
                      <input type="email" placeholder="trainer@gym.in" value={form.email} onChange={e => set("email", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                  </div>
                </div>

                {/* ── Professional Details ── */}
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Professional Details</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Specialty <span className="text-red-500">*</span></label>
                      <select required value={form.specialty} onChange={e => set("specialty", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="">Select specialty</option>
                        {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Experience</label>
                        <input type="text" placeholder="e.g. 5 years" value={form.experience} onChange={e => set("experience", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Certification</label>
                        <input type="text" placeholder="e.g. ACE Certified" value={form.cert} onChange={e => set("cert", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Monthly Salary (₹)</label>
                      <input type="number" placeholder="25000" value={form.salary} onChange={e => set("salary", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Bio</label>
                      <textarea rows={2} placeholder="Brief bio about the trainer..." value={form.bio} onChange={e => set("bio", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setError(""); }}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || uploading}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editId ? "Update Trainer" : "Add Trainer"}
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
