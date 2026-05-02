"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { promoAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Tag, Plus, Copy, Trash2, Edit2, TrendingUp,
  X, Check, RefreshCw, Search, ToggleLeft, ToggleRight,
  Calendar, Percent, DollarSign, Users, ChevronDown,
} from "lucide-react";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const isExpired = (validUntil) => validUntil && new Date(validUntil) < new Date();

const statusBadge = (promo) => {
  if (!promo.active)           return { label: "Inactive",  cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" };
  if (isExpired(promo.validUntil)) return { label: "Expired",  cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit)
                               return { label: "Exhausted", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  return { label: "Active", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
};

const EMPTY_FORM = {
  code: "", description: "", discountType: "percentage", discountValue: "",
  minAmount: "0", maxDiscount: "", usageLimit: "", validFrom: "", validUntil: "",
  active: true,
};

// ── Promo Form Modal ───────────────────────────────────────────────
function PromoFormModal({ editPromo, onClose, onSaved }) {
  const toDateInput = (d) => d ? new Date(d).toISOString().split("T")[0] : "";

  const [form,    setForm]    = useState(
    editPromo ? {
      code:          editPromo.code          || "",
      description:   editPromo.description   || "",
      discountType:  editPromo.discountType  || "percentage",
      discountValue: String(editPromo.discountValue || ""),
      minAmount:     String(editPromo.minAmount  ?? "0"),
      maxDiscount:   editPromo.maxDiscount   ? String(editPromo.maxDiscount) : "",
      usageLimit:    editPromo.usageLimit    ? String(editPromo.usageLimit)  : "",
      validFrom:     toDateInput(editPromo.validFrom),
      validUntil:    toDateInput(editPromo.validUntil),
      active:        editPromo.active ?? true,
    } : { ...EMPTY_FORM, validFrom: new Date().toISOString().split("T")[0] }
  );
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue || !form.validUntil) return;
    setSaving(true);
    try {
      const payload = {
        code:          form.code.toUpperCase().trim(),
        description:   form.description,
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
        minAmount:     Number(form.minAmount) || 0,
        maxDiscount:   form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit:    form.usageLimit  ? Number(form.usageLimit)  : null,
        validFrom:     form.validFrom   ? new Date(form.validFrom) : new Date(),
        validUntil:    new Date(form.validUntil),
        active:        form.active,
      };
      if (editPromo) {
        await promoAPI.update(editPromo._id, payload);
        showSuccess("Promo updated!");
      } else {
        await promoAPI.create(payload);
        showSuccess("Promo created!");
      }
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 1000);
    } catch (err) {
      showError(err.message || "Failed to save promo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">{editPromo ? "Edit Promo Code" : "Create Promo Code"}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">{editPromo ? "Update promo details" : "Create a new discount code"}</p>
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
            <p className="text-lg font-bold text-[var(--text)]">{editPromo ? "Promo Updated!" : "Promo Created!"}</p>
            <p className="text-sm text-[var(--muted)] mt-1">Code <span className="font-mono font-bold">{form.code.toUpperCase()}</span> is ready.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* Code */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Promo Code <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="e.g. SUMMER30"
                value={form.code}
                onChange={e => set("code", e.target.value.toUpperCase())}
                disabled={!!editPromo}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] font-mono font-bold uppercase placeholder:text-[var(--muted2)] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 disabled:opacity-60" />
              {editPromo && <p className="text-[10px] text-[var(--muted2)] mt-1">Code cannot be changed after creation</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Description</label>
              <input type="text" placeholder="e.g. Summer sale discount"
                value={form.description} onChange={e => set("description", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
            </div>

            {/* Discount Type */}
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-2">Discount Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "percentage", label: "Percentage (%)", icon: Percent },
                  { value: "fixed",      label: "Fixed Amount (₹)", icon: DollarSign },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => set("discountType", opt.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer ${
                      form.discountType === opt.value
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-violet-300"
                    }`}>
                    <opt.icon size={14} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Value + Max Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">
                  {form.discountType === "percentage" ? "Discount %" : "Discount ₹"} <span className="text-red-500">*</span>
                </label>
                <input required type="number" min="1"
                  max={form.discountType === "percentage" ? "100" : undefined}
                  placeholder={form.discountType === "percentage" ? "30" : "500"}
                  value={form.discountValue} onChange={e => set("discountValue", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>
              {form.discountType === "percentage" && (
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Max Discount ₹ <span className="text-[var(--muted2)]">(optional)</span></label>
                  <input type="number" min="0" placeholder="e.g. 1000"
                    value={form.maxDiscount} onChange={e => set("maxDiscount", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                </div>
              )}
            </div>

            {/* Min Amount + Usage Limit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Min Order ₹</label>
                <input type="number" min="0" placeholder="0"
                  value={form.minAmount} onChange={e => set("minAmount", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Usage Limit <span className="text-[var(--muted2)]">(blank = unlimited)</span></label>
                <input type="number" min="1" placeholder="e.g. 1000"
                  value={form.usageLimit} onChange={e => set("usageLimit", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>
            </div>

            {/* Valid From + Until */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Valid From</label>
                <input type="date" value={form.validFrom} onChange={e => set("validFrom", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Valid Until <span className="text-red-500">*</span></label>
                <input required type="date" value={form.validUntil} onChange={e => set("validUntil", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-3 border border-[var(--border)] rounded-xl px-4">
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Active</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">Promo can be used when active</p>
              </div>
              <button type="button" onClick={() => set("active", !form.active)}
                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${form.active ? "bg-violet-600" : "bg-[var(--border)]"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.active ? "left-6" : "left-1"}`} />
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
                {saving ? "Saving..." : editPromo ? "Update Promo" : "Create Promo"}
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
  const [promos,       setPromos]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal,    setShowModal]    = useState(false);
  const [editPromo,    setEditPromo]    = useState(null);
  const [copying,      setCopying]      = useState(null);

  // ── Fetch promos ───────────────────────────────────────────────
  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promoAPI.getAll();
      setPromos(res.data || []);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load promos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  // ── Copy code to clipboard ─────────────────────────────────────
  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopying(code);
      showSuccess(`Copied: ${code}`);
      setTimeout(() => setCopying(null), 1500);
    } catch {
      showError("Copy failed");
    }
  };

  // ── Toggle active ──────────────────────────────────────────────
  const handleToggle = async (promo) => {
    try {
      await promoAPI.update(promo._id, { active: !promo.active });
      showSuccess(`Promo ${promo.active ? "deactivated" : "activated"}`);
      fetchPromos();
    } catch (err) {
      showError(err.message || "Toggle failed");
    }
  };

  // ── Delete promo ───────────────────────────────────────────────
  const handleDelete = async (promo) => {
    const confirmed = await confirmToast(`Delete promo "${promo.code}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await promoAPI.delete(promo._id);
      showSuccess("Promo deleted");
      fetchPromos();
    } catch (err) {
      showError(err.message || "Delete failed");
    }
  };

  // ── Filter ─────────────────────────────────────────────────────
  const filtered = promos.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      p.code?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);

    const badge = statusBadge(p).label;
    const matchStatus =
      filterStatus === "All"      ? true :
      filterStatus === "Active"   ? badge === "Active" :
      filterStatus === "Expired"  ? badge === "Expired" :
      filterStatus === "Inactive" ? badge === "Inactive" :
      filterStatus === "Exhausted"? badge === "Exhausted" : true;

    return matchSearch && matchStatus;
  });

  // ── Stats ──────────────────────────────────────────────────────
  const activeCount    = promos.filter(p => statusBadge(p).label === "Active").length;
  const totalUses      = promos.reduce((s, p) => s + (p.usedCount || 0), 0);
  const expiredCount   = promos.filter(p => isExpired(p.validUntil)).length;

  return (
    <RoleDashboardLayout title="Promo Codes" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Promo Codes</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage global discount codes and offers</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchPromos}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => { setEditPromo(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm cursor-pointer">
              <Plus size={15} /> Create Promo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Codes",  value: promos.length,              icon: Tag },
            { label: "Active",       value: activeCount,                 icon: Check },
            { label: "Total Uses",   value: totalUses.toLocaleString(),  icon: Users },
            { label: "Expired",      value: expiredCount,                icon: Calendar },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                {loading
                  ? <div className="h-6 bg-[var(--surface2)] rounded animate-pulse w-12" />
                  : <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>}
                <s.icon size={16} className="text-[var(--muted2)]" />
              </div>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search by code or description..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Active", "Expired", "Inactive", "Exhausted"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filterStatus === f
                    ? "bg-violet-600 text-white"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Promo Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[var(--surface2)]" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-[var(--surface2)] rounded w-28" />
                    <div className="h-3 bg-[var(--surface2)] rounded w-20" />
                  </div>
                </div>
                <div className="h-8 bg-[var(--surface2)] rounded w-24 mb-2" />
                <div className="h-3 bg-[var(--surface2)] rounded w-full mb-4" />
                <div className="h-8 bg-[var(--surface2)] rounded-lg" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
            <Tag size={40} className="text-[var(--muted2)] mx-auto mb-3" />
            <p className="font-semibold text-[var(--text)]">No promo codes found</p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {search ? "Try a different search term" : "Create your first promo code"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => {
              const badge  = statusBadge(p);
              const pct    = p.usageLimit ? Math.round((p.usedCount / p.usageLimit) * 100) : 0;
              const discountLabel = p.discountType === "percentage"
                ? `${p.discountValue}% off`
                : `₹${p.discountValue?.toLocaleString()} off`;

              return (
                <div key={p._id}
                  className={`bg-[var(--surface)] border-2 rounded-xl p-5 hover:shadow-md transition-shadow ${
                    badge.label === "Active" ? "border-[var(--border)]" : "border-[var(--border)] opacity-70"
                  }`}>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tag size={16} className="text-violet-600" />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-[var(--text)] tracking-wide">{p.code}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {p.discountType === "percentage" ? "Percentage" : "Fixed"} discount
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Discount value */}
                  <p className="text-2xl font-black text-[var(--text)] mb-1">{discountLabel}</p>

                  {/* Description */}
                  {p.description && (
                    <p className="text-xs text-[var(--muted)] mb-2 truncate">{p.description}</p>
                  )}

                  {/* Meta */}
                  <div className="text-xs text-[var(--muted)] mb-3 space-y-0.5">
                    {p.minAmount > 0 && <p>Min order: ₹{p.minAmount.toLocaleString()}</p>}
                    {p.maxDiscount && <p>Max discount: ₹{p.maxDiscount.toLocaleString()}</p>}
                    <p className="flex items-center gap-1">
                      <Calendar size={11} />
                      {fmtDate(p.validFrom)} → {fmtDate(p.validUntil)}
                    </p>
                  </div>

                  {/* Usage bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={11} />
                        {(p.usedCount || 0).toLocaleString()} / {p.usageLimit ? p.usageLimit.toLocaleString() : "∞"} uses
                      </span>
                      {p.usageLimit && (
                        <span className={`font-semibold ${pct >= 90 ? "text-red-500" : "text-[var(--text)]"}`}>
                          {pct}%
                        </span>
                      )}
                    </div>
                    {p.usageLimit && (
                      <div className="h-1.5 bg-[var(--surface2)] rounded-full">
                        <div
                          className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-violet-500"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(p.code)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-[var(--surface2)] text-[var(--text)] rounded-lg hover:bg-[var(--border)] transition-colors cursor-pointer">
                      {copying === p.code
                        ? <><Check size={12} className="text-emerald-500" /> Copied!</>
                        : <><Copy size={12} /> Copy Code</>}
                    </button>
                    <button
                      onClick={() => handleToggle(p)}
                      className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                        p.active
                          ? "border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600"
                          : "border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600"
                      }`}
                      title={p.active ? "Deactivate" : "Activate"}>
                      {p.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button
                      onClick={() => { setEditPromo(p); setShowModal(true); }}
                      className="p-2 border border-[var(--border)] rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[var(--muted)] hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-2 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {!loading && promos.length > 0 && (
          <p className="text-xs text-[var(--muted2)] text-center">
            Showing {filtered.length} of {promos.length} promo codes
          </p>
        )}
      </div>

      {/* ── Promo Form Modal ── */}
      {showModal && (
        <PromoFormModal
          editPromo={editPromo}
          onClose={() => { setShowModal(false); setEditPromo(null); }}
          onSaved={fetchPromos}
        />
      )}
    </RoleDashboardLayout>
  );
}
