"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { planAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  ClipboardList, Plus, Edit2, Trash2, Check, X,
  TrendingUp, RefreshCw, Users, ToggleLeft, ToggleRight,
  ChevronDown, Star,
} from "lucide-react";

// ── Static color map (no dynamic Tailwind) ─────────────────────────
const colorMap = {
  gray:    { bg: "bg-gray-100 dark:bg-gray-800",         text: "text-gray-700 dark:text-gray-300",      btn: "bg-gray-600 hover:bg-gray-700",         bar: "bg-gray-500" },
  blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",       text: "text-blue-700 dark:text-blue-400",      btn: "bg-blue-600 hover:bg-blue-700",         bar: "bg-blue-500" },
  violet:  { bg: "bg-violet-50 dark:bg-violet-900/20",   text: "text-violet-700 dark:text-violet-400",  btn: "bg-violet-600 hover:bg-violet-700",      bar: "bg-violet-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400",btn: "bg-emerald-600 hover:bg-emerald-700",    bar: "bg-emerald-500" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",    btn: "bg-amber-600 hover:bg-amber-700",        bar: "bg-amber-500" },
  pink:    { bg: "bg-pink-50 dark:bg-pink-900/20",       text: "text-pink-700 dark:text-pink-400",      btn: "bg-pink-600 hover:bg-pink-700",          bar: "bg-pink-500" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-900/20",       text: "text-teal-700 dark:text-teal-400",      btn: "bg-teal-600 hover:bg-teal-700",          bar: "bg-teal-500" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-900/20",       text: "text-rose-700 dark:text-rose-400",      btn: "bg-rose-600 hover:bg-rose-700",          bar: "bg-rose-500" },
};
const COLOR_OPTIONS = ["gray", "blue", "violet", "emerald", "amber", "pink", "teal", "rose"];
const UNIT_OPTIONS  = ["Day", "Days", "Month", "Months", "Year", "Years"];
const EMPTY_FORM    = { name: "", price: "", duration: "", unit: "Months", color: "violet", features: [""], popular: false };

// ── Plan Form Modal ────────────────────────────────────────────────
function PlanFormModal({ editPlan, onClose, onSaved }) {
  const [form,    setForm]    = useState(
    editPlan ? {
      name:     editPlan.name     || "",
      price:    String(editPlan.price || ""),
      duration: String(editPlan.duration || ""),
      unit:     editPlan.unit     || "Months",
      color:    editPlan.color    || "violet",
      features: editPlan.features?.length ? [...editPlan.features] : [""],
      popular:  editPlan.popular  || false,
    } : EMPTY_FORM
  );
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setFeature    = (i, v) => setForm(p => { const f = [...p.features]; f[i] = v; return { ...p, features: f }; });
  const addFeature    = ()     => setForm(p => ({ ...p, features: [...p.features, ""] }));
  const removeFeature = (i)    => setForm(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) return;
    setSaving(true);
    try {
      const payload = {
        name:     form.name,
        price:    Number(form.price),
        duration: Number(form.duration),
        unit:     form.unit,
        color:    form.color,
        features: form.features.filter(f => f.trim()),
        popular:  form.popular,
      };
      if (editPlan) {
        await planAPI.update(editPlan._id, payload);
        showSuccess("Plan updated!");
      } else {
        await planAPI.create(payload);
        showSuccess("Plan created!");
      }
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 1000);
    } catch (err) {
      showError(err.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{editPlan ? "Edit Plan" : "Create New Plan"}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">{editPlan ? "Update plan details" : "Design a new membership plan"}</p>
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
            <p className="text-lg font-bold text-[var(--text)]">{editPlan ? "Plan Updated!" : "Plan Created!"}</p>
            <p className="text-sm text-[var(--muted)] mt-1">{form.name} plan has been {editPlan ? "updated" : "created"}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Plan Name <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="e.g. Monthly Premium" value={form.name} onChange={e => set("name", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
            </div>

            {/* Price + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                <input required type="number" placeholder="1499" min="1" value={form.price} onChange={e => set("price", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Duration <span className="text-red-500">*</span></label>
                <input required type="number" placeholder="1" min="1" value={form.duration} onChange={e => set("duration", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>
            </div>

            {/* Unit */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-2">Duration Unit</label>
              <div className="flex gap-2 flex-wrap">
                {UNIT_OPTIONS.map(u => (
                  <button key={u} type="button" onClick={() => set("unit", u)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all cursor-pointer ${
                      form.unit === u
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-violet-300"
                    }`}>{u}</button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-2">Card Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(col => (
                  <button key={col} type="button" onClick={() => set("color", col)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${colorMap[col]?.bar || "bg-gray-400"} ${
                      form.color === col ? "border-[var(--text)] scale-110" : "border-transparent opacity-70 hover:opacity-100"
                    }`} title={col} />
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[var(--muted)]">Features</label>
                <button type="button" onClick={addFeature} className="text-xs text-violet-600 font-medium hover:text-violet-700 cursor-pointer">
                  + Add feature
                </button>
              </div>
              <div className="space-y-2">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" placeholder={`Feature ${i + 1}`} value={f} onChange={e => setFeature(i, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                    {form.features.length > 1 && (
                      <button type="button" onClick={() => removeFeature(i)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex-shrink-0 cursor-pointer">
                        <X size={14} className="text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Popular toggle */}
            <div className="flex items-center justify-between py-3 border border-[var(--border)] rounded-xl px-4">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Mark as Most Popular</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">Shows a badge on this plan card</p>
              </div>
              <button type="button" onClick={() => set("popular", !form.popular)}
                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${form.popular ? "bg-violet-600" : "bg-[var(--border)]"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.popular ? "left-6" : "left-1"}`} />
              </button>
            </div>

            {/* Actions */}
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
                {saving ? "Saving..." : editPlan ? "Update Plan" : "Create Plan"}
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
  const [plans,        setPlans]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editPlan,     setEditPlan]     = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  // ── Fetch plans ────────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = showInactive ? { includeInactive: "true" } : {};
      const res = await planAPI.getAll(params);
      setPlans(res.data || []);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  // ── Toggle active/inactive ─────────────────────────────────────
  const handleToggle = async (plan) => {
    try {
      await planAPI.toggle(plan._id);
      showSuccess(`Plan ${plan.active ? "deactivated" : "activated"}`);
      fetchPlans();
    } catch (err) {
      showError(err.message || "Toggle failed");
    }
  };

  // ── Delete plan ────────────────────────────────────────────────
  const handleDelete = async (plan) => {
    const confirmed = await confirmToast(`Delete "${plan.name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await planAPI.delete(plan._id);
      showSuccess("Plan deleted");
      fetchPlans();
    } catch (err) {
      showError(err.message || "Delete failed");
    }
  };

  // ── Stats ──────────────────────────────────────────────────────
  const activePlans      = plans.filter(p => p.active);
  const totalSubscribers = plans.reduce((s, p) => s + (p.totalSubscribers || 0), 0);
  const popularPlan      = plans.find(p => p.popular);
  const avgPrice         = activePlans.length
    ? Math.round(activePlans.reduce((s, p) => s + p.price, 0) / activePlans.length)
    : 0;

  // For subscriber bar width
  const maxSubs = Math.max(...plans.map(p => p.totalSubscribers || 0), 1);

  return (
    <RoleDashboardLayout title="Plans & Pricing" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Plans & Pricing</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage platform-wide membership plans</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchPlans}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowInactive(v => !v)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                showInactive
                  ? "bg-amber-100 dark:bg-amber-900/20 border-amber-300 text-amber-700 dark:text-amber-400"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
              }`}>
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </button>
            <button
              onClick={() => { setEditPlan(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm shadow-sm cursor-pointer">
              <Plus size={15} /> Create Plan
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Plans",        value: plans.length,                    icon: ClipboardList },
            { label: "Active Subscribers", value: totalSubscribers.toLocaleString(), icon: Users },
            { label: "Most Popular",       value: popularPlan?.name || "—",        icon: Star },
            { label: "Avg Price",          value: avgPrice ? `₹${avgPrice.toLocaleString()}` : "—", icon: TrendingUp },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                {loading
                  ? <div className="h-6 bg-[var(--surface2)] rounded animate-pulse w-16" />
                  : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>}
                <s.icon size={16} className="text-[var(--muted2)]" />
              </div>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Plan Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 animate-pulse">
                <div className="h-7 bg-[var(--surface2)] rounded w-24 mb-4" />
                <div className="h-8 bg-[var(--surface2)] rounded w-32 mb-2" />
                <div className="h-4 bg-[var(--surface2)] rounded w-20 mb-4" />
                <div className="space-y-2 mb-4">
                  {[...Array(3)].map((_, j) => <div key={j} className="h-3 bg-[var(--surface2)] rounded w-full" />)}
                </div>
                <div className="h-8 bg-[var(--surface2)] rounded-lg" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
            <ClipboardList size={40} className="text-[var(--muted2)] mx-auto mb-3" />
            <p className="font-semibold text-[var(--text)]">No plans yet</p>
            <p className="text-sm text-[var(--muted)] mt-1">Create your first membership plan to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {plans.map(plan => {
              const c   = colorMap[plan.color] || colorMap.violet;
              const pct = Math.round(((plan.totalSubscribers || 0) / maxSubs) * 100);
              return (
                <div key={plan._id}
                  className={`bg-[var(--surface)] border-2 rounded-2xl p-5 sm:p-6 relative hover:shadow-lg transition-shadow ${
                    !plan.active ? "opacity-60" :
                    plan.popular ? "border-violet-500" : "border-[var(--border)]"
                  }`}>

                  {/* Badges */}
                  {plan.popular && plan.active && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  )}
                  {!plan.active && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      INACTIVE
                    </span>
                  )}

                  {/* Duration badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${c.bg} mb-4`}>
                    <ClipboardList size={14} className={c.text} />
                    <span className={`text-xs font-semibold ${c.text}`}>{plan.duration} {plan.unit}</span>
                  </div>

                  {/* Name + Price */}
                  <h3 className="text-xl font-bold text-[var(--text)]">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1 mb-4">
                    <span className="text-3xl font-black text-[var(--text)]">₹{plan.price.toLocaleString()}</span>
                    <span className="text-sm text-[var(--muted)]">/ {plan.duration} {plan.unit.toLowerCase()}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Check size={14} className="text-emerald-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>

                  {/* Subscriber bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {(plan.totalSubscribers || 0).toLocaleString()} subscribers
                      </span>
                      <span className="font-semibold text-[var(--text)]">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--surface2)] rounded-full">
                      <div className={`h-1.5 rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Added by */}
                  {plan.addedBy?.name && (
                    <p className="text-[10px] text-[var(--muted2)] mb-3">
                      Added by {plan.addedBy.name}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditPlan(plan); setShowModal(true); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer ${c.btn}`}>
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleToggle(plan)}
                      className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                        plan.active
                          ? "border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600"
                          : "border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600"
                      }`}
                      title={plan.active ? "Deactivate" : "Activate"}>
                      {plan.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-2 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Count footer */}
        {!loading && plans.length > 0 && (
          <p className="text-xs text-[var(--muted2)] text-center">
            {activePlans.length} active · {plans.length - activePlans.length} inactive · {plans.length} total plans
          </p>
        )}
      </div>

      {/* ── Plan Form Modal ── */}
      {showModal && (
        <PlanFormModal
          editPlan={editPlan}
          onClose={() => { setShowModal(false); setEditPlan(null); }}
          onSaved={fetchPlans}
        />
      )}
    </RoleDashboardLayout>
  );
}
