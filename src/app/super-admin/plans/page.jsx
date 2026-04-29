"use client";
import { useState } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { ClipboardList, Plus, Edit2, Trash2, Check, X, TrendingUp } from "lucide-react";

const INITIAL_PLANS = [
  { id: "P001", name: "Day Pass",    price: 199,    duration: "1",   unit: "Day",   features: ["Full gym access", "Locker room"],                                    color: "gray",    active: 800 },
  { id: "P002", name: "Weekly",      price: 699,    duration: "7",   unit: "Days",  features: ["Full gym access", "Locker room", "Group classes"],                   color: "blue",    active: 1200 },
  { id: "P003", name: "Monthly",     price: 1499,   duration: "30",  unit: "Days",  features: ["Full gym access", "Locker room", "1 PT session"],                    color: "blue",    active: 4200 },
  { id: "P004", name: "Quarterly",   price: 3999,   duration: "90",  unit: "Days",  features: ["Full gym access", "Locker room", "3 PT sessions", "Diet plan"],      color: "violet",  active: 2800, popular: true },
  { id: "P005", name: "Yearly",      price: 11999,  duration: "365", unit: "Days",  features: ["Full gym access", "Locker room", "Unlimited PT", "Diet plan", "Priority booking"], color: "emerald", active: 1900 },
  { id: "P006", name: "Class Pass",  price: 2999,   duration: "30",  unit: "Days",  features: ["Unlimited classes", "Yoga, Zumba, HIIT", "App access"],              color: "amber",   active: 600 },
  { id: "P007", name: "Family Plan", price: 8999,   duration: "30",  unit: "Days",  features: ["Up to 4 members", "Full gym access", "Group classes", "Diet plan"],  color: "pink",    active: 320 },
];

const colorMap = {
  gray:    { bg: "bg-gray-100 dark:bg-gray-800",        text: "text-gray-700 dark:text-gray-300",     btn: "bg-gray-600 hover:bg-gray-700",        bar: "bg-gray-500" },
  blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",      text: "text-blue-700 dark:text-blue-400",     btn: "bg-blue-600 hover:bg-blue-700",        bar: "bg-blue-500" },
  violet:  { bg: "bg-violet-50 dark:bg-violet-900/20",  text: "text-violet-700 dark:text-violet-400", btn: "bg-violet-600 hover:bg-violet-700",    bar: "bg-violet-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20",text: "text-emerald-700 dark:text-emerald-400",btn: "bg-emerald-600 hover:bg-emerald-700", bar: "bg-emerald-500" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",    text: "text-amber-700 dark:text-amber-400",   btn: "bg-amber-600 hover:bg-amber-700",      bar: "bg-amber-500" },
  pink:    { bg: "bg-pink-50 dark:bg-pink-900/20",      text: "text-pink-700 dark:text-pink-400",     btn: "bg-pink-600 hover:bg-pink-700",        bar: "bg-pink-500" },
};
const COLOR_OPTIONS = ["gray", "blue", "violet", "emerald", "amber", "pink"];
const EMPTY = { name: "", price: "", duration: "", unit: "Days", color: "violet", features: [""], popular: false };

export default function Page() {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setFeature = (i, v) => setForm(p => { const f = [...p.features]; f[i] = v; return { ...p, features: f }; });
  const addFeature = () => setForm(p => ({ ...p, features: [...p.features, ""] }));
  const removeFeature = (i) => setForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

  const openAdd = () => { setEditPlan(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({ name: plan.name, price: String(plan.price), duration: plan.duration, unit: plan.unit, color: plan.color, features: [...plan.features], popular: plan.popular || false });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const cleanFeatures = form.features.filter(f => f.trim());
    if (editPlan) {
      setPlans(p => p.map(pl => pl.id === editPlan.id ? { ...pl, name: form.name, price: Number(form.price), duration: form.duration, unit: form.unit, color: form.color, features: cleanFeatures, popular: form.popular } : pl));
    } else {
      setPlans(p => [...p, { id: `P00${p.length + 1}`, name: form.name, price: Number(form.price), duration: form.duration, unit: form.unit, color: form.color, features: cleanFeatures, popular: form.popular, active: 0 }]);
    }
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY); }, 1200);
  };

  const deletePlan = (id) => setPlans(p => p.filter(pl => pl.id !== id));
  const totalActive = plans.reduce((s, p) => s + p.active, 0);

  return (
    <RoleDashboardLayout title="Plans & Pricing" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Plans & Pricing</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage platform-wide membership plans</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm w-fit shadow-sm">
            <Plus size={15} /> Create Plan
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Plans",        value: plans.length },
            { label: "Active Subscribers", value: totalActive.toLocaleString() },
            { label: "Most Popular",       value: plans.find(p => p.popular)?.name || "—" },
            { label: "Avg Price",          value: `₹${Math.round(plans.reduce((s, p) => s + p.price, 0) / plans.length).toLocaleString()}` },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {plans.map(plan => {
            const c = colorMap[plan.color] || colorMap.violet;
            const pct = totalActive > 0 ? Math.round((plan.active / totalActive) * 100) : 0;
            return (
              <div key={plan.id} className={`bg-[var(--surface)] border-2 rounded-2xl p-5 sm:p-6 relative hover:shadow-lg transition-shadow ${plan.popular ? "border-violet-500" : "border-[var(--border)]"}`}>
                {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">MOST POPULAR</span>}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${c.bg} mb-4`}>
                  <ClipboardList size={14} className={c.text} />
                  <span className={`text-xs font-semibold ${c.text}`}>{plan.duration} {plan.unit}</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--text)]">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1 mb-4">
                  <span className="text-3xl font-black text-[var(--text)]">₹{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-[var(--muted)]">/ {plan.duration} {plan.unit.toLowerCase()}</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <Check size={14} className="text-emerald-500 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
                    <span className="flex items-center gap-1"><TrendingUp size={11} /> {plan.active.toLocaleString()} subscribers</span>
                    <span className="font-semibold text-[var(--text)]">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--surface2)] rounded-full">
                    <div className={`h-1.5 rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(plan)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${c.btn}`}>
                    <Edit2 size={13} /> Edit Plan
                  </button>
                  <button onClick={() => deletePlan(plan.id)} className="p-2 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 text-[var(--muted)] hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CREATE / EDIT PLAN MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{editPlan ? "Edit Plan" : "Create New Plan"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{editPlan ? "Update plan details" : "Design a new membership plan"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--surface2)] rounded-lg"><X size={18} className="text-[var(--muted)]" /></button>
            </div>
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4"><Check size={32} className="text-emerald-600" /></div>
                <p className="text-lg font-bold text-[var(--text)]">{editPlan ? "Plan Updated!" : "Plan Created!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name} plan has been {editPlan ? "updated" : "created"}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Plan Name <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Monthly Premium" value={form.name} onChange={e => set("name", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                    <input required type="number" placeholder="1499" min="1" value={form.price} onChange={e => set("price", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Duration <span className="text-red-500">*</span></label>
                    <input required type="number" placeholder="30" min="1" value={form.duration} onChange={e => set("duration", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Duration Unit</label>
                  <div className="flex gap-2">
                    {["Day", "Days", "Months"].map(u => (
                      <button key={u} type="button" onClick={() => set("unit", u)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.unit === u ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400" : "border-[var(--border)] text-[var(--muted)] hover:border-violet-300"}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Card Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map(col => (
                      <button key={col} type="button" onClick={() => set("color", col)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${colorMap[col].bar} ${form.color === col ? "border-[var(--text)] scale-110" : "border-transparent"}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[var(--muted)]">Features</label>
                    <button type="button" onClick={addFeature} className="text-xs text-violet-600 font-medium hover:text-violet-700">+ Add feature</button>
                  </div>
                  <div className="space-y-2">
                    {form.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" placeholder={`Feature ${i + 1}`} value={f} onChange={e => setFeature(i, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                        {form.features.length > 1 && (
                          <button type="button" onClick={() => removeFeature(i)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex-shrink-0">
                            <X size={14} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border border-[var(--border)] rounded-xl px-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">Mark as Most Popular</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Shows a badge on this plan</p>
                  </div>
                  <button type="button" onClick={() => set("popular", !form.popular)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${form.popular ? "bg-violet-600" : "bg-[var(--border)]"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.popular ? "left-6" : "left-1"}`} />
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editPlan ? "Update Plan" : "Create Plan"}
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
