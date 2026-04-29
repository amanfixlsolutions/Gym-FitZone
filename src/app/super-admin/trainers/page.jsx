"use client";
import { useState } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { Search, Star, MapPin, CheckCircle, XCircle, Plus, X, Check, Edit2, Trash2 } from "lucide-react";

const GYMS = ["Iron Paradise", "PowerHouse Gym", "FitLife Studio", "Zen Yoga", "CrossFit Arena", "Muscle Factory"];
const SPECIALTIES = ["Strength & HIIT", "Yoga & Meditation", "Bodybuilding", "Zumba & Dance", "CrossFit", "Pilates", "Cardio & Endurance", "Nutrition & Diet", "Personal Training"];

const INITIAL = [
  { id: "T001", name: "Arjun Kapoor",  gym: "Iron Paradise",  city: "Mumbai",    specialty: "Strength & HIIT",  rating: 4.9, sessions: 142, status: "Active",   verified: true,  avatar: "AK", color: "from-blue-500 to-blue-700",    cert: "ACE Certified",  experience: "5 years" },
  { id: "T002", name: "Meera Nair",    gym: "Zen Yoga",       city: "Hyderabad", specialty: "Yoga & Meditation",rating: 4.8, sessions: 98,  status: "Active",   verified: true,  avatar: "MN", color: "from-purple-500 to-purple-700", cert: "RYT 500",        experience: "7 years" },
  { id: "T003", name: "Rohit Sharma",  gym: "PowerHouse Gym", city: "Bangalore", specialty: "Bodybuilding",     rating: 4.7, sessions: 210, status: "Active",   verified: true,  avatar: "RS", color: "from-emerald-500 to-emerald-700",cert: "NASM CPT",      experience: "8 years" },
  { id: "T004", name: "Divya Patel",   gym: "FitLife Studio", city: "Delhi",     specialty: "Zumba & Dance",    rating: 4.9, sessions: 176, status: "Active",   verified: false, avatar: "DP", color: "from-pink-500 to-pink-700",    cert: "Zumba Licensed", experience: "4 years" },
  { id: "T005", name: "Karan Mehta",   gym: "CrossFit Arena", city: "Kolkata",   specialty: "CrossFit",         rating: 4.6, sessions: 88,  status: "On Leave", verified: true,  avatar: "KM", color: "from-amber-500 to-amber-700",  cert: "CrossFit L2",    experience: "3 years" },
  { id: "T006", name: "Sunita Rao",    gym: "FitLife Studio", city: "Delhi",     specialty: "Pilates",          rating: 4.8, sessions: 124, status: "Active",   verified: true,  avatar: "SR", color: "from-teal-500 to-teal-700",    cert: "STOTT Pilates",  experience: "6 years" },
];

const COLORS = ["from-blue-500 to-blue-700", "from-purple-500 to-purple-700", "from-emerald-500 to-emerald-700", "from-pink-500 to-pink-700", "from-amber-500 to-amber-700", "from-teal-500 to-teal-700"];
const EMPTY = { name: "", gym: "", city: "", specialty: "", cert: "", experience: "", phone: "", email: "" };

export default function Page() {
  const [trainers, setTrainers] = useState(INITIAL);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.gym.toLowerCase().includes(search.toLowerCase()) ||
    t.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditTrainer(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (t) => {
    setEditTrainer(t);
    setForm({ name: t.name, gym: t.gym, city: t.city, specialty: t.specialty, cert: t.cert, experience: t.experience, phone: "", email: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialty || !form.gym) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const initials = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    if (editTrainer) {
      setTrainers(p => p.map(t => t.id === editTrainer.id ? { ...t, name: form.name, gym: form.gym, city: form.city, specialty: form.specialty, cert: form.cert, experience: form.experience } : t));
    } else {
      setTrainers(p => [...p, { id: `T00${p.length + 1}`, name: form.name, gym: form.gym, city: form.city, specialty: form.specialty, cert: form.cert, experience: form.experience, rating: 0, sessions: 0, status: "Active", verified: false, avatar: initials, color: COLORS[p.length % COLORS.length] }]);
    }
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY); }, 1200);
  };

  const toggleVerify = (id) => setTrainers(p => p.map(t => t.id === id ? { ...t, verified: !t.verified } : t));
  const deleteTrainer = (id) => setTrainers(p => p.filter(t => t.id !== id));

  return (
    <RoleDashboardLayout title="Trainers" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">All Trainers</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform-wide certified trainer management</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm w-fit shadow-sm">
            <Plus size={15} /> Add Trainer
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Trainers", value: trainers.length },
            { label: "Active",         value: trainers.filter(t => t.status === "Active").length },
            { label: "Unverified",     value: trainers.filter(t => !t.verified).length },
            { label: "Avg Rating",     value: trainers.filter(t => t.rating > 0).length ? `${(trainers.filter(t => t.rating > 0).reduce((s, t) => s + t.rating, 0) / trainers.filter(t => t.rating > 0).length).toFixed(1)}★` : "—" },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
          <input type="text" placeholder="Search by name, gym or specialty..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{t.avatar}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-[var(--text)]">{t.name}</p>
                      {t.verified ? <CheckCircle size={13} className="text-emerald-500" /> : <XCircle size={13} className="text-amber-500" />}
                    </div>
                    <p className="text-xs text-[var(--muted)]">{t.specialty}</p>
                    {t.cert && <p className="text-[10px] text-violet-600 font-medium mt-0.5">{t.cert}</p>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-3">
                <MapPin size={12} /> {t.gym} · {t.city}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-[var(--surface2)] rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1">
                    {t.rating > 0 ? <><Star size={11} className="text-amber-400 fill-amber-400" /><p className="text-sm font-bold text-[var(--text)]">{t.rating}</p></> : <p className="text-sm text-[var(--muted)]">—</p>}
                  </div>
                  <p className="text-[10px] text-[var(--muted)]">Rating</p>
                </div>
                <div className="bg-[var(--surface2)] rounded-lg p-2">
                  <p className="text-sm font-bold text-[var(--text)]">{t.sessions}</p>
                  <p className="text-[10px] text-[var(--muted)]">Sessions</p>
                </div>
                <div className="bg-[var(--surface2)] rounded-lg p-2">
                  <span className={`text-xs font-semibold ${t.status === "Active" ? "text-emerald-600" : "text-amber-600"}`}>{t.status}</span>
                  <p className="text-[10px] text-[var(--muted)]">Status</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!t.verified && (
                  <button onClick={() => toggleVerify(t.id)} className="flex-1 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors">
                    ✓ Verify
                  </button>
                )}
                {t.verified && (
                  <button onClick={() => openEdit(t)} className="flex-1 py-1.5 bg-[var(--surface2)] text-[var(--text)] text-xs font-semibold rounded-lg hover:bg-[var(--border)] transition-colors flex items-center justify-center gap-1">
                    <Edit2 size={12} /> Edit
                  </button>
                )}
                <button onClick={() => deleteTrainer(t.id)} className="p-1.5 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 text-[var(--muted)] hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ADD / EDIT TRAINER MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{editTrainer ? "Edit Trainer" : "Add New Trainer"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{editTrainer ? "Update trainer details" : "Register a new trainer on the platform"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--surface2)] rounded-lg"><X size={18} className="text-[var(--muted)]" /></button>
            </div>
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4"><Check size={32} className="text-emerald-600" /></div>
                <p className="text-lg font-bold text-[var(--text)]">{editTrainer ? "Trainer Updated!" : "Trainer Added!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name} has been {editTrainer ? "updated" : "registered"}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input required type="text" placeholder="e.g. Arjun Kapoor" value={form.name} onChange={e => set("name", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Assign Gym <span className="text-red-500">*</span></label>
                    <select required value={form.gym} onChange={e => set("gym", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                      <option value="">Select gym</option>
                      {GYMS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">City</label>
                    <input type="text" placeholder="Mumbai" value={form.city} onChange={e => set("city", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Specialty <span className="text-red-500">*</span></label>
                    <select required value={form.specialty} onChange={e => set("specialty", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                      <option value="">Select specialty</option>
                      {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Certification</label>
                    <input type="text" placeholder="e.g. ACE Certified" value={form.cert} onChange={e => set("cert", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Experience</label>
                    <input type="text" placeholder="e.g. 5 years" value={form.experience} onChange={e => set("experience", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editTrainer ? "Update Trainer" : "Add Trainer"}
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
