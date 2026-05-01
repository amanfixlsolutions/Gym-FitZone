"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { useAuth } from "@/context/AuthContext";
import { planAPI } from "@/lib/api";
import { confirmToast, showSuccess, showError } from "@/lib/toast";
import { ClipboardList, Plus, Edit2, Trash2, Check, X, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

const colorMap = {
  gray:    { bg: "bg-gray-100 dark:bg-gray-800",         text: "text-gray-700 dark:text-gray-300",      btn: "bg-gray-600 hover:bg-gray-700",         bar: "bg-gray-500" },
  blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",       text: "text-blue-700 dark:text-blue-400",      btn: "bg-blue-600 hover:bg-blue-700",         bar: "bg-blue-500" },
  purple:  { bg: "bg-purple-50 dark:bg-purple-900/20",   text: "text-purple-700 dark:text-purple-400",  btn: "bg-purple-600 hover:bg-purple-700",     bar: "bg-purple-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400",btn: "bg-emerald-600 hover:bg-emerald-700",   bar: "bg-emerald-500" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",    btn: "bg-amber-600 hover:bg-amber-700",       bar: "bg-amber-500" },
  pink:    { bg: "bg-pink-50 dark:bg-pink-900/20",       text: "text-pink-700 dark:text-pink-400",      btn: "bg-pink-600 hover:bg-pink-700",         bar: "bg-pink-500" },
};
const COLOR_OPTIONS = ["gray", "blue", "purple", "emerald", "amber", "pink"];
const EMPTY_FORM = { name: "", price: "", duration: "", unit: "Months", color: "blue", features: [""], popular: false };

export default function Page() {
  const { user } = useAuth();

  const [plans,     setPlans]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setFeature = (i, v) => setForm(p => { const f = [...p.features]; f[i] = v; return { ...p, features: f }; });
  const addFeature = () => setForm(p => ({ ...p, features: [...p.features, ""] }));
  const removeFeature = (i) => setForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

  // ── Fetch plans from backend ───────────────────────────────────
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const res = await planAPI.getAll();
      setPlans(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setError(""); setShowModal(true); };
  const openEdit = (plan) => {
    setEditId(plan._id);
    setForm({
      name:     plan.name,
      price:    String(plan.price),
      duration: String(plan.duration),
      unit:     plan.unit || "Months",
      color:    plan.color || "blue",
      features: plan.features?.length ? [...plan.features] : [""],
      popular:  plan.popular || false,
    });
    setError(""); setShowModal(true);
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) return;
    setSaving(true); setError("");

    const payload = {
      name:     form.name,
      price:    Number(form.price),
      duration: Number(form.duration),
      unit:     form.unit,
      color:    form.color,
      features: form.features.filter(f => f.trim()),
      popular:  form.popular,
      active:   true,
    };

    try {
      if (editId) {
        const res = await planAPI.update(editId, payload);
        setPlans(p => p.map(pl => pl._id === editId ? res.data : pl));
        showSuccess(`"${payload.name}" plan updated successfully!`);
      } else {
        const res = await planAPI.create(payload);
        setPlans(p => [res.data, ...p]);
        showSuccess(`"${payload.name}" plan created successfully!`);
      }
      setSaving(false); setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); }, 1400);
    } catch (err) {
      setError(err.message || "Failed to save plan");
      showError(err.message || "Failed to save plan");
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (id, planName) => {
    const confirmed = await confirmToast(`Delete "${planName}" plan? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await planAPI.delete(id);
      setPlans(p => p.filter(pl => pl._id !== id));
      showSuccess(`"${planName}" plan deleted.`);
    } catch (err) {
      showError(err.message || "Failed to delete plan");
    }
  };

  const totalActive = plans.reduce((s, p) => s + (p.activeSubscribers || 0), 0);

  return (
    <RoleDashboardLayout title="Plans & Pricing" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Plans & Pricing</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage membership plans for your gym</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchPlans} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors" title="Refresh">
              <RefreshCw size={15} className="text-[var(--muted)]" />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm">
              <Plus size={15} /> Create Plan
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
            { label: "Total Plans",        value: plans.length },
            { label: "Active Subscribers", value: totalActive.toLocaleString() },
            { label: "Most Popular",       value: plans.find(p => p.popular)?.name || "—" },
            { label: "Avg Price",          value: plans.length ? `₹${Math.round(plans.reduce((s, p) => s + p.price, 0) / plans.length).toLocaleString()}` : "—" },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Plan cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No plans yet</p>
            <p className="text-sm mt-1">Click "Create Plan" to add your first membership plan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {plans.map(plan => {
              const c = colorMap[plan.color] || colorMap.blue;
              const pct = totalActive > 0 ? Math.round(((plan.activeSubscribers || 0) / totalActive) * 100) : 0;
              return (
                <div key={plan._id} className={`bg-[var(--surface)] border-2 rounded-2xl p-5 sm:p-6 relative hover:shadow-lg transition-shadow ${plan.popular ? "border-purple-500" : "border-[var(--border)]"}`}>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  )}
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
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Check size={14} className="text-emerald-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
                      <span className="flex items-center gap-1"><TrendingUp size={11} /> {(plan.activeSubscribers || 0).toLocaleString()} subscribers</span>
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
                    <button onClick={() => handleDelete(plan._id, plan.name)} className="p-2 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 text-[var(--muted)] hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
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
                <h2 className="text-lg font-bold text-[var(--text)]">{editId ? "Edit Plan" : "Create New Plan"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{editId ? "Update plan details" : "Design a new membership plan"}</p>
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
                <p className="text-lg font-bold text-[var(--text)]">{editId ? "Plan Updated!" : "Plan Created!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name} plan has been {editId ? "updated" : "created"} successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
                    <AlertCircle size={13} />{error}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Plan Name <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="e.g. Monthly Premium" value={form.name} onChange={e => set("name", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                    <input required type="number" placeholder="1499" min="1" value={form.price} onChange={e => set("price", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Duration <span className="text-red-500">*</span></label>
                    <input required type="number" placeholder="1" min="1" value={form.duration} onChange={e => set("duration", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Duration Unit</label>
                  <div className="flex gap-2 flex-wrap">
                    {["Day", "Days", "Months", "Years"].map(u => (
                      <button key={u} type="button" onClick={() => set("unit", u)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.unit === u ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-[var(--border)] text-[var(--muted)] hover:border-blue-300"}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Card Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map(col => {
                      const c = colorMap[col];
                      return (
                        <button key={col} type="button" onClick={() => set("color", col)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${c.bar} ${form.color === col ? "border-[var(--text)] scale-110" : "border-transparent"}`} />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[var(--muted)]">Features</label>
                    <button type="button" onClick={addFeature} className="text-xs text-blue-600 font-medium hover:text-blue-700">+ Add feature</button>
                  </div>
                  <div className="space-y-2">
                    {form.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" placeholder={`Feature ${i + 1}`} value={f} onChange={e => setFeature(i, e.target.value)}
                          className="flex-1 px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
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
                    <p className="text-xs text-[var(--muted)] mt-0.5">Shows a "Most Popular" badge</p>
                  </div>
                  <button type="button" onClick={() => set("popular", !form.popular)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${form.popular ? "bg-blue-600" : "bg-[var(--border)]"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.popular ? "left-6" : "left-1"}`} />
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setError(""); }}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editId ? "Update Plan" : "Create Plan"}
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
