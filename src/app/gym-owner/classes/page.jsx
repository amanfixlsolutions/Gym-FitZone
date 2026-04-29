"use client";
import { useState } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { Plus, Clock, Users, Edit2, Trash2, CalendarCheck, X, Check } from "lucide-react";

const INITIAL_CLASSES = [
  { id: "C001", name: "Morning Yoga",      trainer: "Meera Nair",   days: "Mon, Wed, Fri", time: "6:00–7:00 AM",  capacity: 20, enrolled: 20, price: "Included",   status: "Active" },
  { id: "C002", name: "HIIT Blast",        trainer: "Arjun Kapoor", days: "Tue, Thu, Sat", time: "7:00–8:00 AM",  capacity: 20, enrolled: 15, price: "Included",   status: "Active" },
  { id: "C003", name: "Zumba Dance",       trainer: "Divya Patel",  days: "Mon–Sat",       time: "9:00–10:00 AM", capacity: 25, enrolled: 18, price: "₹299/class", status: "Active" },
  { id: "C004", name: "Strength Training", trainer: "Rohit Sharma", days: "Mon, Wed, Fri", time: "5:00–6:00 PM",  capacity: 15, enrolled: 10, price: "Included",   status: "Active" },
  { id: "C005", name: "Evening Yoga",      trainer: "Meera Nair",   days: "Tue, Thu",      time: "7:00–8:00 PM",  capacity: 25, enrolled: 22, price: "Included",   status: "Active" },
  { id: "C006", name: "CrossFit",          trainer: "Arjun Kapoor", days: "Sat, Sun",      time: "8:00–9:00 AM",  capacity: 12, enrolled: 8,  price: "₹499/class", status: "Paused" },
];

const TRAINERS = ["Meera Nair", "Arjun Kapoor", "Rohit Sharma", "Divya Patel", "Karan Mehta"];
const DAYS_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EMPTY_FORM = { name: "", trainer: "", startTime: "06:00", endTime: "07:00", capacity: "", price: "", priceType: "included", days: [], description: "" };

export default function Page() {
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [showModal, setShowModal] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleDay = (d) => setForm(p => ({ ...p, days: p.days.includes(d) ? p.days.filter(x => x !== d) : [...p.days, d] }));

  const openAdd = () => { setEditClass(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => {
    setEditClass(c);
    setForm({ name: c.name, trainer: c.trainer, startTime: "06:00", endTime: "07:00", capacity: String(c.capacity), price: c.price === "Included" ? "" : c.price.replace("₹","").replace("/class",""), priceType: c.price === "Included" ? "included" : "paid", days: c.days.split(", "), description: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.trainer || form.days.length === 0) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const priceStr = form.priceType === "included" ? "Included" : `₹${form.price}/class`;
    if (editClass) {
      setClasses(p => p.map(c => c.id === editClass.id ? { ...c, name: form.name, trainer: form.trainer, days: form.days.join(", "), time: `${form.startTime}–${form.endTime}`, capacity: Number(form.capacity) || c.capacity, price: priceStr } : c));
    } else {
      setClasses(p => [...p, { id: `C00${p.length + 1}`, name: form.name, trainer: form.trainer, days: form.days.join(", "), time: `${form.startTime}–${form.endTime}`, capacity: Number(form.capacity) || 20, enrolled: 0, price: priceStr, status: "Active" }]);
    }
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); }, 1200);
  };

  const deleteClass = (id) => setClasses(p => p.filter(c => c.id !== id));

  return (
    <RoleDashboardLayout title="Classes" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Class Schedule</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage classes, trainers and capacity</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-fit shadow-sm">
            <Plus size={15} /> Add Class
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Classes",  value: classes.length },
            { label: "Active",         value: classes.filter(c => c.status === "Active").length },
            { label: "Total Enrolled", value: classes.reduce((s, c) => s + c.enrolled, 0) },
            { label: "Avg Occupancy",  value: `${Math.round(classes.reduce((s, c) => s + (c.enrolled / c.capacity) * 100, 0) / classes.length)}%` },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map(c => {
            const pct = Math.round((c.enrolled / c.capacity) * 100);
            return (
              <div key={c.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text)]">{c.name}</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{c.trainer}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${c.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>{c.status}</span>
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Clock size={12} />{c.time}</div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><CalendarCheck size={12} />{c.days}</div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Users size={12} />{c.enrolled}/{c.capacity} enrolled</div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                    <span>Capacity</span>
                    <span className={pct >= 90 ? "text-red-500 font-semibold" : "text-[var(--text)]"}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--surface2)] rounded-full">
                    <div className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-blue-600"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600">{c.price}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={13} className="text-blue-600" /></button>
                    <button onClick={() => deleteClass(c.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={13} className="text-red-500" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ADD / EDIT CLASS MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{editClass ? "Edit Class" : "Add New Class"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{editClass ? "Update class details" : "Schedule a new class for your gym"}</p>
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
                <p className="text-lg font-bold text-[var(--text)]">{editClass ? "Class Updated!" : "Class Added!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name} has been {editClass ? "updated" : "scheduled"} successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Class Name <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Morning Yoga" value={form.name} onChange={e => set("name", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Trainer <span className="text-red-500">*</span></label>
                  <select required value={form.trainer} onChange={e => set("trainer", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="">Select trainer</option>
                    {TRAINERS.map(t => <option key={t}>{t}</option>)}
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
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      style={{ backgroundImage: "none" }}
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Description (optional)</label>
                  <textarea rows={2} placeholder="Brief description of the class..." value={form.description} onChange={e => set("description", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editClass ? "Update Class" : "Add Class"}
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
