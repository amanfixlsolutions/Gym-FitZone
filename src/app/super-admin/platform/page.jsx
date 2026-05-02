"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { settingsAPI, gymAPI, promoAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import Link from "next/link";
import {
  Percent, Save, Star, Megaphone, RefreshCw, Shield,
  Users, Clock, Gift, AlertTriangle, CheckCircle,
  Tag, ArrowRight, Settings, Zap,
} from "lucide-react";

export default function Page() {
  const [settings,  setSettings]  = useState(null);
  const [gyms,      setGyms]      = useState([]);
  const [promos,    setPromos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  // Local editable platform config
  const [platform, setPlatform] = useState({
    commissionRate:    10,
    maxPauseDays:      30,
    referralBonus:     500,
    trialDays:         7,
    maintenanceMode:   false,
    allowRegistration: true,
  });

  // ── Fetch all data ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, gymsRes, promosRes] = await Promise.all([
        settingsAPI.get(),
        gymAPI.getAll({ status: "active", limit: 10 }),
        promoAPI.getAll(),
      ]);

      const s = settingsRes.data;
      setSettings(s);

      // Populate platform form from DB
      if (s?.platform) {
        setPlatform({
          commissionRate:    s.platform.commissionRate    ?? 10,
          maxPauseDays:      s.platform.maxPauseDays      ?? 30,
          referralBonus:     s.platform.referralBonus     ?? 500,
          trialDays:         s.platform.trialDays         ?? 7,
          maintenanceMode:   s.platform.maintenanceMode   ?? false,
          allowRegistration: s.platform.allowRegistration ?? true,
        });
      }

      setGyms(gymsRes.data || []);
      setPromos((promosRes.data || []).slice(0, 5));
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Save platform settings ─────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update({ platform });
      showSuccess("Platform settings saved!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const setP = (k, v) => setPlatform(prev => ({ ...prev, [k]: v }));

  const inputCls = "w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400";

  // ── Toggle helper ──────────────────────────────────────────────
  const Toggle = ({ value, onChange, disabled }) => (
    <button type="button" onClick={() => !disabled && onChange(!value)}
      className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${value ? "bg-violet-600" : "bg-[var(--border)]"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${value ? "left-6" : "left-1"}`} />
    </button>
  );

  return (
    <RoleDashboardLayout title="Platform Config" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Platform Configuration</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Global settings, commission rates and platform controls</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors font-medium text-sm cursor-pointer">
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Maintenance mode warning */}
        {platform.maintenanceMode && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">Maintenance Mode is ON</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">The platform is currently offline for all users except super-admins.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* ── Commission & Rates ── */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                <Percent size={16} className="text-violet-600" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Commission & Rates</h3>
            </div>
            <div className="space-y-4">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1">
                    <div className="h-3 bg-[var(--surface2)] rounded w-32" />
                    <div className="h-9 bg-[var(--surface2)] rounded" />
                  </div>
                ))
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1">Platform Commission (%)</label>
                    <input type="number" min="0" max="50" step="0.5"
                      value={platform.commissionRate}
                      onChange={e => setP("commissionRate", parseFloat(e.target.value) || 0)}
                      className={inputCls} />
                    <p className="text-xs text-[var(--muted2)] mt-1">Percentage taken from each gym transaction</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1">Referral Bonus (₹)</label>
                    <input type="number" min="0"
                      value={platform.referralBonus}
                      onChange={e => setP("referralBonus", parseInt(e.target.value) || 0)}
                      className={inputCls} />
                    <p className="text-xs text-[var(--muted2)] mt-1">Reward credited per successful referral</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1">Trial Period (days)</label>
                    <input type="number" min="0" max="90"
                      value={platform.trialDays}
                      onChange={e => setP("trialDays", parseInt(e.target.value) || 0)}
                      className={inputCls} />
                    <p className="text-xs text-[var(--muted2)] mt-1">Free trial days for new gym registrations</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1">Max Pause Days</label>
                    <input type="number" min="1" max="180"
                      value={platform.maxPauseDays}
                      onChange={e => setP("maxPauseDays", parseInt(e.target.value) || 30)}
                      className={inputCls} />
                    <p className="text-xs text-[var(--muted2)] mt-1">Maximum days a member can pause their membership</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Platform Toggles ── */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Platform Controls</h3>
            </div>
            <div className="space-y-1">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--border)] animate-pulse">
                    <div className="space-y-1">
                      <div className="h-3 bg-[var(--surface2)] rounded w-36" />
                      <div className="h-2 bg-[var(--surface2)] rounded w-48" />
                    </div>
                    <div className="w-11 h-6 bg-[var(--surface2)] rounded-full" />
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">User Registration</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Allow new users to sign up on the platform</p>
                    </div>
                    <Toggle value={platform.allowRegistration} onChange={v => setP("allowRegistration", v)} />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">Maintenance Mode</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Take platform offline for all users</p>
                    </div>
                    <Toggle value={platform.maintenanceMode} onChange={v => setP("maintenanceMode", v)} />
                  </div>
                </>
              )}
            </div>

            {/* Quick links to related pages */}
            <div className="mt-5 pt-4 border-t border-[var(--border)] space-y-2">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Quick Links</p>
              {[
                { icon: Tag,     label: "Manage Promo Codes",  href: "/super-admin/promos",        color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                { icon: Shield,  label: "Gym Approvals",       href: "/super-admin/gyms",          color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20" },
                { icon: Users,   label: "All Members",         href: "/super-admin/members",       color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-900/20" },
                { icon: Settings,label: "System Health",       href: "/super-admin/system",        color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20" },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--surface2)] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                      <item.icon size={13} className={item.color} />
                    </div>
                    <span className="text-sm font-medium text-[var(--text)]">{item.label}</span>
                  </div>
                  <ArrowRight size={14} className="text-[var(--muted2)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── Active Gyms ── */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <Star size={16} className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-[var(--text)]">Active Gyms</h3>
              </div>
              <Link href="/super-admin/gyms" className="text-xs text-violet-600 font-medium hover:text-violet-700">
                Manage all →
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-[var(--surface2)] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : gyms.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-4">No active gyms yet</p>
            ) : (
              <div className="space-y-2">
                {gyms.slice(0, 6).map(g => (
                  <div key={g._id} className="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {g.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{g.name}</p>
                        <p className="text-xs text-[var(--muted)]">{g.city} · {g.totalMembers || 0} members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">
                        {g.status}
                      </span>
                    </div>
                  </div>
                ))}
                {gyms.length > 6 && (
                  <p className="text-xs text-[var(--muted)] text-center pt-1">+{gyms.length - 6} more gyms</p>
                )}
              </div>
            )}
          </div>

          {/* ── Active Promo Codes ── */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Megaphone size={16} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-[var(--text)]">Active Promo Codes</h3>
              </div>
              <Link href="/super-admin/promos" className="text-xs text-violet-600 font-medium hover:text-violet-700">
                Manage all →
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-[var(--surface2)] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : promos.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-[var(--muted)] mb-3">No promo codes yet</p>
                <Link href="/super-admin/promos"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-600 font-medium hover:text-violet-700">
                  Create your first promo <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {promos.map(p => {
                  const isExpired = p.validUntil && new Date(p.validUntil) < new Date();
                  const isActive  = p.active && !isExpired;
                  return (
                    <div key={p._id} className="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[var(--text)]">{p.code}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          {p.discountType === "percentage" ? `${p.discountValue}% off` : `₹${p.discountValue} off`}
                          {" · "}{(p.usedCount || 0).toLocaleString()} used
                          {p.validUntil ? ` · Expires ${new Date(p.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Link href="/super-admin/promos"
                  className="flex items-center justify-center gap-1.5 w-full py-2 border-2 border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--muted)] hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                  + Create Promo Code
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Save button bottom */}
        <div className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-4">
          <div>
            <p className="text-sm font-medium text-[var(--text)]">Platform Settings</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Commission rate, referral bonus, trial days and toggles are saved to the database</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors font-medium text-sm cursor-pointer">
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : saved ? <CheckCircle size={15} /> : <Save size={15} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save All Changes"}
          </button>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
