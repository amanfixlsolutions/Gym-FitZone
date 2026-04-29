"use client";
import { useState } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { Plus, Star, MoreVertical, X, Check, Phone, Mail, Award } from "lucide-react";

const INITIAL_TRAINERS = [
  { id: "T001", name: "Arjun Kapoor",  specialty: "Strength & HIIT",  rating: 4.9, sessions: 142, clients: 28, status: "Active",   avatar: "AK", color: "from-blue-500 to-blue-700",    phone: "+91 98765 43210", email: "arjun@ironparadise.in",  experience: "5 years",  cert: "ACE Certified" },
  { id: "T002", name: "Meera Nair",    specialty: "Yoga & Meditation", rating: 4.8, sessions: 98,  clients: 22, status: "Active",   avatar: "MN", color: "from-purple-500 to-purple-700", phone: "+91 98765 43211", email: "meera@ironparadise.in",  experience: "7 years",  cert: "RYT 500" },
  { id: "T003", name: "Rohit Sharma",  specialty: "Bodybuilding",      rating: 4.7, sessions: 210, clients: 35, status: "Active",   avatar: "RS", color: "from-emerald-500 to-emerald-700",phone: "+91 98765 43212", email: "rohit@ironparadise.in",  experience: "8 years",  cert: "NASM CPT" },
  { id: "T004", name: "Divya Patel",   specialty: "Zumba & Dance",     rating: 4.9, sessions: 176, clients: 40, status: "Active",   avatar: "DP", color: "from-pink-500 to-pink-700",    phone: "+91 98765 43213", email: "divya@ironparadise.in",  experience: "4 years",  cert: "Zumba Licensed" },
  { id: "T005", name: "Karan Mehta",   specialty: "CrossFit",          rating: 4.6, sessions: 88,  clients: 18, status: "On Leave", avatar: "KM", color: "from-amber-500 to-amber-700",  phone: "+91 98765 43214", email: "karan@ironparadise.in",  experience: "3 years",  cert: "CrossFit L2" },
];

const SPECIALTIES = ["Strength & HIIT", "Yoga & Meditation", "Bodybuilding", "Zumba & Dance", "CrossFit", "Pilates", "Cardio & Endurance", "Nutrition & Diet", "Personal Training"];
const EMPTY_FORM = { name: "", specialty: "", phone: "", email: "", experience: "", cert: "", bio: "", salary: "" };

export default function Page() {
  const [trainers, setTrainers] = useState(INITIAL_TRAINERS);
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [viewTrainer, setViewTrainer] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setEditTrainer(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (t) => {
    setEditTrainer(t);
    setForm({ name: t.name, specialty: t.specialty, phone: t.phone, email: t.email, experience: t.experience, cert: t.cert, bio: "", salary: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialty || !form.phone) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const initials = form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const colors = ["from-blue-500 to-blue-700", "from-purple-500 to-purple-700", "from-emerald-500 to-emerald-700", "from-pink-500 to-pink-700", "from-amber-500 to-amber-700", "from-teal-500 to-teal-700"];
    if (editTrainer) {
      setTrainers(p => p.map(t => t.id === editTrainer.id ? { ...t, name: form.name, specialty: form.specialty, phone: form.phone, email: form.email, experience: form.experience, cert: form.cert } : t));
    } else {
      setTrainers(p => [...p, { id: `T00${p.length + 1}`, name: form.name, specialty: form.specialty, rating: 0, sessions: 0, clients: 0, status: "Active", avatar: initials, color: colors[p.length % colors.length], phone: form.phone, email: form.email, experience: form.experience, cert: form.cert }]);
    }
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); }, 1200);
  };

  const deleteTrainer = (id) => setTrainers(p => p.filter(t => t.id !== id));

  return (
    <RoleDashboardLayout title="Trainers" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Trainers</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage your gym's certified trainers</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-fit shadow-sm">
            <Plus size={15} /> Add Trainer
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Trainers", value: trainers.length },
            { label: "Active",         value: trainers.filter(t => t.status === "Active").length },
            { label: "On Leave",       value: trainers.filter(t => t.status === "On Leave").length },
            { label: "Avg Rating",     value: trainers.filter(t => t.rating > 0).length ? `${(trainers.filter(t => t.rating > 0).reduce((s, t) => s + t.rating, 0) / trainers.filter(t => t.rating > 0).length).toFixed(1)}★` : "—" },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {trainers.map(t => (
            <div key={t.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-[var(--text)]">{t.name}</p>
                    <p className="text-xs text-[var(--muted)]">{t.specialty}</p>
                    {t.cert && <p className="text-[10px] text-blue-600 font-medium mt-0.5">{t.cert}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><MoreVertical size={15} className="text-[var(--muted)]" /></button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-[var(--surface2)] rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1">
                    {t.rating > 0 ? <><Star size={11} className="text-amber-400 fill-amber-400" /><p className="text-sm font-bold text-[var(--text)]">{t.rating}</p></> : <p className="text-sm font-bold text-[var(--muted)]">—</p>}
                  </div>
                  <p className="text-[10px] text-[var(--muted)]">Rating</p>
                </div>
                <div className="bg-[var(--surface2)] rounded-lg p-2">
                  <p className="text-sm font-bold text-[var(--text)]">{t.sessions}</p>
                  <p className="text-[10px] text-[var(--muted)]">Sessions</p>
                </div>
                <div className="bg-[var(--surface2)] rounded-lg p-2">
                  <p className="text-sm font-bold text-[var(--text)]">{t.clients}</p>
                  <p className="text-[10px] text-[var(--muted)]">Clients</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>{t.status}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="text-xs text-blue-600 font-medium hover:text-blue-700 px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => deleteTrainer(t.id)} className="text-xs text-red-500 font-medium hover:text-red-600 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Remove</button>
                </div>
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
                <p className="text-xs text-[var(--muted)] mt-0.5">{editTrainer ? "Update trainer details" : "Register a new trainer at your gym"}</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="p-2 hover:bg-[var(--surface2)] rounded-lg">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-[var(--text)]">{editTrainer ? "Trainer Updated!" : "Trainer Added!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name} has been {editTrainer ? "updated" : "registered"} successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
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
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Bio (optional)</label>
                      <textarea rows={2} placeholder="Brief bio about the trainer..." value={form.bio} onChange={e => set("bio", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
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
