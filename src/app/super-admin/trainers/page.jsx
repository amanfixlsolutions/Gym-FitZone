"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { trainerAPI, gymAPI, uploadAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Search, Star, MapPin, CheckCircle, XCircle, Plus, X, Check,
  Edit2, Trash2, RefreshCw, Shield, Phone, Mail, Award, Clock,
  ChevronDown, Users,
} from "lucide-react";

const SPECIALTIES = [
  "Strength & HIIT", "Yoga & Meditation", "Bodybuilding", "Zumba & Dance",
  "CrossFit", "Pilates", "Cardio & Endurance", "Nutrition & Diet",
  "Personal Training", "Kickboxing", "Swimming", "Cycling",
];

const AVATAR_COLORS = [
  "from-blue-500 to-blue-700", "from-purple-500 to-purple-700",
  "from-emerald-500 to-emerald-700", "from-pink-500 to-pink-700",
  "from-amber-500 to-amber-700", "from-teal-500 to-teal-700",
  "from-rose-500 to-rose-700", "from-indigo-500 to-indigo-700",
];

const EMPTY_FORM = {
  name: "", email: "", phone: "", gym: "",
  specialty: "", certification: "", experience: "",
  bio: "", salary: "", status: "Active", photo: "",
};

// ── Resolve photo URL ──────────────────────────────────────────────
// DB stores either a full URL (https://res.cloudinary.com/...) or a
// relative path (/uploads/trainers/...). Prepend backend origin for
// relative paths so the browser can actually fetch the file.
const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
  .replace(/\/api$/, "");

const resolvePhoto = (photo) => {
  if (!photo) return "";
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  return `${BACKEND}${photo.startsWith("/") ? "" : "/"}${photo}`;
};

// ── Trainer detail modal ───────────────────────────────────────────
function TrainerDetailModal({ trainer, onClose, onEdit, onVerify, onDelete }) {
  if (!trainer) return null;
  const initials = trainer.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colorIdx = trainer.name?.charCodeAt(0) % AVATAR_COLORS.length || 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text)]">Trainer Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
            <X size={18} className="text-[var(--muted)]" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden relative`}>
              {trainer.photo
                ? <img src={resolvePhoto(trainer.photo)} alt={trainer.name} className="absolute inset-0 w-full h-full object-cover rounded-2xl" onError={e => { e.currentTarget.style.display = "none"; }} />
                : null}
              <span className={trainer.photo ? "opacity-0" : ""}>{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[var(--text)] text-lg">{trainer.name}</h3>
                {trainer.verified
                  ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full"><CheckCircle size={11} /> Verified</span>
                  : <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full"><XCircle size={11} /> Unverified</span>}
              </div>
              <p className="text-sm text-[var(--muted)]">{trainer.specialty}</p>
              {trainer.certification && <p className="text-xs text-violet-600 font-medium mt-0.5">{trainer.certification}</p>}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Rating",   value: trainer.rating > 0 ? `${trainer.rating}★` : "—" },
              { label: "Sessions", value: trainer.totalSessions || 0 },
              { label: "Clients",  value: trainer.totalClients  || 0 },
            ].map(s => (
              <div key={s.label} className="bg-[var(--surface2)] rounded-xl p-3 text-center">
                <p className="font-bold text-[var(--text)]">{s.value}</p>
                <p className="text-[10px] text-[var(--muted)]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-sm">
            {trainer.gym?.name && (
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <MapPin size={14} className="flex-shrink-0" />
                <span>{trainer.gym.name}{trainer.gym.city ? ` · ${trainer.gym.city}` : ""}</span>
              </div>
            )}
            {trainer.email && (
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Mail size={14} className="flex-shrink-0" />
                <span>{trainer.email}</span>
              </div>
            )}
            {trainer.phone && (
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Phone size={14} className="flex-shrink-0" />
                <span>{trainer.phone}</span>
              </div>
            )}
            {trainer.experience && (
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Clock size={14} className="flex-shrink-0" />
                <span>{trainer.experience} experience</span>
              </div>
            )}
            {trainer.bio && (
              <p className="text-[var(--muted)] leading-relaxed pt-1">{trainer.bio}</p>
            )}
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              trainer.status === "Active"   ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
              trainer.status === "On Leave" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
              "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}>{trainer.status}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {!trainer.verified && (
              <button onClick={() => { onVerify(trainer); onClose(); }}
                className="flex-1 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                <Shield size={14} /> Verify Trainer
              </button>
            )}
            <button onClick={() => { onEdit(trainer); onClose(); }}
              className="flex-1 py-2 bg-[var(--surface2)] text-[var(--text)] text-sm font-semibold rounded-xl hover:bg-[var(--border)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <Edit2 size={14} /> Edit
            </button>
            <button onClick={() => { onDelete(trainer); onClose(); }}
              className="px-4 py-2 border border-[var(--border)] text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Modal ───────────────────────────────────────────────
function TrainerFormModal({ editTrainer, gyms, onClose, onSaved }) {
  const [form, setForm] = useState(
    editTrainer
      ? {
          name:          editTrainer.name          || "",
          email:         editTrainer.email         || "",
          phone:         editTrainer.phone         || "",
          gym:           editTrainer.gym?._id || editTrainer.gym || "",
          specialty:     editTrainer.specialty     || "",
          certification: editTrainer.certification || "",
          experience:    editTrainer.experience    || "",
          bio:           editTrainer.bio           || "",
          salary:        editTrainer.salary        || "",
          status:        editTrainer.status        || "Active",
          photo:         editTrainer.photo         || "",
        }
      : EMPTY_FORM
  );
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.upload(file, "trainers");
      set("photo", res.url || res.data?.url || "");
      showSuccess("Photo uploaded!");
    } catch (err) {
      showError("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialty || !form.gym || !form.email || !form.phone) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        salary: form.salary ? Number(form.salary) : 0,
      };
      if (editTrainer) {
        await trainerAPI.update(editTrainer._id, payload);
        showSuccess("Trainer updated!");
      } else {
        await trainerAPI.create(payload);
        showSuccess("Trainer added!");
      }
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 1000);
    } catch (err) {
      showError(err.message || "Failed to save trainer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{editTrainer ? "Edit Trainer" : "Add New Trainer"}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">{editTrainer ? "Update trainer details" : "Register a new trainer on the platform"}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
            <X size={18} className="text-[var(--muted)]" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-[var(--text)]">{editTrainer ? "Trainer Updated!" : "Trainer Added!"}</p>
            <p className="text-sm text-[var(--muted)] mt-1">{form.name} has been {editTrainer ? "updated" : "registered"}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="e.g. Arjun Kapoor" value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Email <span className="text-red-500">*</span></label>
                <input required type="email" placeholder="trainer@gym.com" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Phone <span className="text-red-500">*</span></label>
                <input required type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
              </div>

              {/* Assign Gym */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Assign Gym <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select required value={form.gym} onChange={e => set("gym", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    <option value="">Select gym</option>
                    {gyms.map(g => <option key={g._id} value={g._id}>{g.name} — {g.city}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Specialty <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select required value={form.specialty} onChange={e => set("specialty", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>

              {/* Certification */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Certification</label>
                <input type="text" placeholder="e.g. ACE Certified" value={form.certification} onChange={e => set("certification", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>

              {/* Experience */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Experience</label>
                <input type="text" placeholder="e.g. 5 years" value={form.experience} onChange={e => set("experience", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>

              {/* Salary */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Monthly Salary (₹)</label>
                <input type="number" min="0" placeholder="e.g. 35000" value={form.salary} onChange={e => set("salary", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Status</label>
                <div className="relative">
                  <select value={form.status} onChange={e => set("status", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Inactive</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Profile Photo</label>
                <div className="flex items-center gap-3">
                  {/* Preview */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden relative">
                    {form.photo
                      ? <img src={resolvePhoto(form.photo)} alt="preview" className="absolute inset-0 w-full h-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />
                      : null}
                    <span className={form.photo ? "opacity-0" : ""}>
                      {form.name ? form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <label className={`flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-[var(--border)] rounded-lg text-xs font-medium text-[var(--muted)] hover:border-violet-400 hover:text-violet-600 transition-colors cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                      {uploading
                        ? <><span className="w-3 h-3 border border-violet-400/40 border-t-violet-500 rounded-full animate-spin" /> Uploading...</>
                        : <><span>📷</span> {form.photo ? "Change Photo" : "Upload Photo"}</>}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                    {form.photo && (
                      <button type="button" onClick={() => set("photo", "")}
                        className="mt-1 text-[10px] text-red-500 hover:underline cursor-pointer">
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Bio</label>
                <textarea rows={3} placeholder="Short bio about the trainer..." value={form.bio} onChange={e => set("bio", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Plus size={15} />}
                {saving ? "Saving..." : editTrainer ? "Update Trainer" : "Add Trainer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function Page() {
  const [trainers,    setTrainers]    = useState([]);
  const [gyms,        setGyms]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterGym,   setFilterGym]   = useState("All"); // "All" or gym._id

  // Modals
  const [showForm,    setShowForm]    = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [viewTrainer, setViewTrainer] = useState(null);

  // ── Fetch trainers + gyms ────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const trainerParams = { limit: 200 };
      if (filterGym !== "All") trainerParams.gymId = filterGym;

      const [tRes, gRes] = await Promise.all([
        trainerAPI.getAll(trainerParams),
        gymAPI.getAll({ status: "active", limit: 100 }),
      ]);
      setTrainers(tRes.data || []);
      setGyms(gRes.data || []);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  }, [filterGym]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Verify trainer ───────────────────────────────────────────
  const handleVerify = async (trainer) => {
    try {
      await trainerAPI.verify(trainer._id);
      showSuccess(`${trainer.name} verified!`);
      fetchData();
    } catch (err) {
      showError(err.message || "Verification failed");
    }
  };

  // ── Delete trainer ───────────────────────────────────────────
  const handleDelete = async (trainer) => {
    const confirmed = await confirmToast(`Delete ${trainer.name}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await trainerAPI.delete(trainer._id);
      showSuccess("Trainer deleted");
      fetchData();
    } catch (err) {
      showError(err.message || "Delete failed");
    }
  };

  // ── Open edit modal ──────────────────────────────────────────
  const openEdit = (trainer) => {
    setEditTrainer(trainer);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditTrainer(null);
    setShowForm(true);
  };

  // ── Filter ───────────────────────────────────────────────────
  const filtered = trainers.filter(t => {
    const q = search.toLowerCase();
    const gymName = t.gym?.name || "";
    const matchSearch = !search ||
      t.name?.toLowerCase().includes(q) ||
      gymName.toLowerCase().includes(q) ||
      t.specialty?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    // gymId filter is handled server-side; client-side fallback for safety
    const matchGym = filterGym === "All" ||
      t.gym?._id === filterGym ||
      t.gym === filterGym;
    return matchSearch && matchStatus && matchGym;
  });

  // ── Stats ────────────────────────────────────────────────────
  // Use filtered trainers so stats update when gym filter is active
  const displayTrainers = filterGym === "All" ? trainers : filtered;
  const activeCount     = displayTrainers.filter(t => t.status === "Active").length;
  const unverifiedCount = displayTrainers.filter(t => !t.verified).length;
  const ratedTrainers   = displayTrainers.filter(t => t.rating > 0);
  const avgRating       = ratedTrainers.length
    ? (ratedTrainers.reduce((s, t) => s + t.rating, 0) / ratedTrainers.length).toFixed(1)
    : null;

  // ── Avatar color ─────────────────────────────────────────────
  const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const initials    = (name) => name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <RoleDashboardLayout title="Trainers" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">All Trainers</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              {filterGym === "All"
                ? "Platform-wide certified trainer management"
                : `${gyms.find(g => g._id === filterGym)?.name || "Selected Gym"} — ${displayTrainers.length} trainer${displayTrainers.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm shadow-sm cursor-pointer">
              <Plus size={15} /> Add Trainer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Trainers", value: displayTrainers.length, icon: Users },
            { label: "Active",         value: activeCount,             icon: CheckCircle },
            { label: "Unverified",     value: unverifiedCount,         icon: XCircle },
            { label: "Avg Rating",     value: avgRating ? `${avgRating}★` : "—", icon: Star },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
                <s.icon size={18} className="text-[var(--muted2)]" />
              </div>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search by name, gym or specialty..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Gym filter dropdown */}
            {gyms.length > 0 && (
              <div className="relative">
                <select
                  value={filterGym}
                  onChange={e => {
                    setFilterGym(e.target.value);
                    // fetchData will re-run via useEffect because filterGym changed
                  }}
                  className="pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] focus:outline-none appearance-none cursor-pointer max-w-[180px]"
                >
                  <option value="All">All Gyms</option>
                  {gyms.map(g => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
              </div>
            )}
            {/* Status filter */}
            {["All", "Active", "On Leave", "Inactive"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filterStatus === s
                    ? "bg-violet-600 text-white"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:border-violet-400"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Trainer Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--surface2)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--surface2)] rounded w-3/4" />
                    <div className="h-3 bg-[var(--surface2)] rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-[var(--surface2)] rounded w-2/3 mb-4" />
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[...Array(3)].map((_, j) => <div key={j} className="h-12 bg-[var(--surface2)] rounded-lg" />)}
                </div>
                <div className="h-8 bg-[var(--surface2)] rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
            <Users size={40} className="text-[var(--muted2)] mx-auto mb-3" />
            <p className="font-semibold text-[var(--text)]">No trainers found</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {search ? "Try a different search term" : "Add your first trainer to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(t => {
              const color = avatarColor(t.name);
              const init  = initials(t.name);
              const gymName = t.gym?.name || "—";
              const gymCity = t.gym?.city || "";
              return (
                <div key={t._id}
                  onClick={() => setViewTrainer(t)}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group">

                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden relative`}>
                        {t.photo
                          ? <img src={resolvePhoto(t.photo)} alt={t.name} className="absolute inset-0 w-full h-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />
                          : null}
                        <span className={t.photo ? "opacity-0" : ""}>{init}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-[var(--text)] group-hover:text-violet-600 transition-colors">{t.name}</p>
                          {t.verified
                            ? <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                            : <XCircle    size={13} className="text-amber-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-[var(--muted)]">{t.specialty}</p>
                        {t.certification && (
                          <p className="text-[10px] text-violet-600 font-medium mt-0.5">{t.certification}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gym location */}
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-3">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="truncate">{gymName}{gymCity ? ` · ${gymCity}` : ""}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-[var(--surface2)] rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1">
                        {t.rating > 0
                          ? <><Star size={11} className="text-amber-400 fill-amber-400" /><p className="text-sm font-bold text-[var(--text)]">{t.rating}</p></>
                          : <p className="text-sm text-[var(--muted)]">—</p>}
                      </div>
                      <p className="text-[10px] text-[var(--muted)]">Rating</p>
                    </div>
                    <div className="bg-[var(--surface2)] rounded-lg p-2">
                      <p className="text-sm font-bold text-[var(--text)]">{t.totalSessions || 0}</p>
                      <p className="text-[10px] text-[var(--muted)]">Sessions</p>
                    </div>
                    <div className="bg-[var(--surface2)] rounded-lg p-2">
                      <span className={`text-xs font-semibold ${
                        t.status === "Active"   ? "text-emerald-600" :
                        t.status === "On Leave" ? "text-amber-600"   : "text-gray-500"
                      }`}>{t.status}</span>
                      <p className="text-[10px] text-[var(--muted)]">Status</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    {!t.verified && (
                      <button onClick={() => handleVerify(t)}
                        className="flex-1 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-1 cursor-pointer">
                        <Shield size={11} /> Verify
                      </button>
                    )}
                    <button onClick={() => openEdit(t)}
                      className="flex-1 py-1.5 bg-[var(--surface2)] text-[var(--text)] text-xs font-semibold rounded-lg hover:bg-[var(--border)] transition-colors flex items-center justify-center gap-1 cursor-pointer">
                      <Edit2 size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(t)}
                      className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results count */}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-[var(--muted2)] text-center">
            Showing {filtered.length} of {trainers.length} trainers
          </p>
        )}
      </div>

      {/* ── Trainer Detail Modal ── */}
      {viewTrainer && (
        <TrainerDetailModal
          trainer={viewTrainer}
          onClose={() => setViewTrainer(null)}
          onEdit={openEdit}
          onVerify={handleVerify}
          onDelete={handleDelete}
        />
      )}

      {/* ── Add / Edit Form Modal ── */}
      {showForm && (
        <TrainerFormModal
          editTrainer={editTrainer}
          gyms={gyms}
          onClose={() => { setShowForm(false); setEditTrainer(null); }}
          onSaved={fetchData}
        />
      )}
    </RoleDashboardLayout>
  );
}
