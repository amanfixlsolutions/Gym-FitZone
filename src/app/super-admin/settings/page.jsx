"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { useAuth } from "@/context/AuthContext";
import { settingsAPI, authAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import {
  User, Shield, Bell, CreditCard, Save, Globe,
  RefreshCw, Check, ChevronRight, Eye, EyeOff,
  Percent, ToggleLeft, ToggleRight,
} from "lucide-react";

const TABS = [
  { id: "profile",  label: "Profile",           icon: User },
  { id: "platform", label: "Platform Settings",  icon: Globe },
  { id: "security", label: "Security",           icon: Shield },
  { id: "notifs",   label: "Notifications",      icon: Bell },
];

const inputCls = "w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all";
const labelCls = "text-xs font-medium text-[var(--muted)] block mb-1.5";

export default function Page() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  // ── Profile form ───────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "",
  });

  // ── Platform settings ──────────────────────────────────────────
  const [platform, setPlatform] = useState({
    commissionRate:    10,
    maxPauseDays:      30,
    referralBonus:     500,
    trialDays:         7,
    maintenanceMode:   false,
    allowRegistration: true,
  });

  // ── Notification preferences ───────────────────────────────────
  const [notifs, setNotifs] = useState({
    emailEnabled:   true,
    smsEnabled:     false,
    pushEnabled:    true,
    newMember:      true,
    paymentSuccess: true,
    expiryReminder: true,
    classReminder:  true,
    lowInventory:   true,
    dailyReport:    false,
  });

  // ── Password form ──────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw,  setShowPw]  = useState({ current: false, new: false, confirm: false });
  const [pwError, setPwError] = useState("");

  // ── Fetch settings ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, meRes] = await Promise.all([
        settingsAPI.get(),
        authAPI.getMe(),
      ]);

      // Populate profile from current user
      const u = meRes.user || {};
      setProfile({
        name:  u.name  || "",
        email: u.email || "",
        phone: u.phone || "",
      });

      // Populate platform settings
      const s = settingsRes.data;
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
      if (s?.notifications) setNotifs(prev => ({ ...prev, ...s.notifications }));
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Save handler ───────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "profile") {
        // Update user profile via auth API
        await authAPI.changePassword({ name: profile.name, phone: profile.phone });
        // Note: email change would need separate verification flow
        showSuccess("Profile updated!");
      } else if (activeTab === "platform") {
        await settingsAPI.update({ platform });
        showSuccess("Platform settings saved!");
      } else if (activeTab === "notifs") {
        await settingsAPI.update({ notifications: notifs });
        showSuccess("Notification preferences saved!");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      showError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwError("All fields are required"); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters"); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Passwords do not match"); return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      showSuccess("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--text)]">{label}</p>
        {desc && <p className="text-xs text-[var(--muted)] mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${checked ? "bg-violet-600" : "bg-[var(--border)]"}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "SA";

  return (
    <RoleDashboardLayout title="Settings" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Settings</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage your account and platform preferences</p>
          </div>
          <button onClick={fetchData} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] cursor-pointer" title="Refresh">
            <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

            {/* Sidebar tabs */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 h-fit">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === id
                      ? "bg-violet-600 text-white"
                      : "text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
                  }`}>
                  <Icon size={15} />
                  <span className="flex-1 text-left">{label}</span>
                  {activeTab !== id && <ChevronRight size={13} className="opacity-40" />}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="xl:col-span-3 space-y-4">

              {/* ── PROFILE ── */}
              {activeTab === "profile" && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-5">
                  <h3 className="font-semibold text-[var(--text)] pb-3 border-b border-[var(--border)]">Profile Information</h3>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text)]">{user?.name || "Super Admin"}</p>
                      <p className="text-sm text-[var(--muted)]">{user?.email || ""}</p>
                      <span className="text-xs text-violet-600 font-semibold">Super Admin</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Full Name</label>
                      <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                        placeholder="Rajiv Sharma" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={profile.email} readOnly
                        className={`${inputCls} opacity-60 cursor-not-allowed`} />
                      <p className="text-[10px] text-[var(--muted2)] mt-1">Email cannot be changed here</p>
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210" className={inputCls} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── PLATFORM SETTINGS ── */}
              {activeTab === "platform" && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                    <Percent size={18} className="text-violet-600" />
                    <h3 className="font-semibold text-[var(--text)]">Platform Settings</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Platform Commission (%)</label>
                      <input type="number" min="0" max="50" step="0.5"
                        value={platform.commissionRate}
                        onChange={e => setPlatform(p => ({ ...p, commissionRate: parseFloat(e.target.value) || 0 }))}
                        className={inputCls} />
                      <p className="text-[10px] text-[var(--muted2)] mt-1">Percentage taken from each gym transaction</p>
                    </div>
                    <div>
                      <label className={labelCls}>Referral Bonus (₹)</label>
                      <input type="number" min="0"
                        value={platform.referralBonus}
                        onChange={e => setPlatform(p => ({ ...p, referralBonus: parseInt(e.target.value) || 0 }))}
                        className={inputCls} />
                      <p className="text-[10px] text-[var(--muted2)] mt-1">Reward per successful referral</p>
                    </div>
                    <div>
                      <label className={labelCls}>Trial Period (days)</label>
                      <input type="number" min="0" max="90"
                        value={platform.trialDays}
                        onChange={e => setPlatform(p => ({ ...p, trialDays: parseInt(e.target.value) || 0 }))}
                        className={inputCls} />
                      <p className="text-[10px] text-[var(--muted2)] mt-1">Free trial for new gym registrations</p>
                    </div>
                    <div>
                      <label className={labelCls}>Max Pause Days</label>
                      <input type="number" min="1" max="180"
                        value={platform.maxPauseDays}
                        onChange={e => setPlatform(p => ({ ...p, maxPauseDays: parseInt(e.target.value) || 30 }))}
                        className={inputCls} />
                      <p className="text-[10px] text-[var(--muted2)] mt-1">Max days a member can pause membership</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] space-y-1">
                    <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Platform Controls</p>
                    <Toggle
                      checked={platform.allowRegistration}
                      onChange={v => setPlatform(p => ({ ...p, allowRegistration: v }))}
                      label="User Registration Open"
                      desc="Allow new users to sign up on the platform"
                    />
                    <Toggle
                      checked={platform.maintenanceMode}
                      onChange={v => setPlatform(p => ({ ...p, maintenanceMode: v }))}
                      label="Maintenance Mode"
                      desc="Take platform offline for all users"
                    />
                  </div>

                  {platform.maintenanceMode && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <span className="text-red-600 text-sm font-semibold">⚠ Maintenance mode is ON — platform is offline for all users</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeTab === "security" && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] mb-5">
                    <Shield size={18} className="text-violet-600" />
                    <h3 className="font-semibold text-[var(--text)]">Change Password</h3>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {pwError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-sm px-4 py-3 rounded-xl">
                        {pwError}
                      </div>
                    )}

                    {[
                      { key: "currentPassword", label: "Current Password",  show: showPw.current, toggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
                      { key: "newPassword",     label: "New Password",      show: showPw.new,     toggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
                      { key: "confirmPassword", label: "Confirm Password",  show: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
                    ].map(f => (
                      <div key={f.key}>
                        <label className={labelCls}>{f.label}</label>
                        <div className="relative">
                          <input
                            type={f.show ? "text" : "password"}
                            value={pwForm[f.key]}
                            onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder="••••••••"
                            className={`${inputCls} pr-10`}
                          />
                          <button type="button" onClick={f.toggle}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] hover:text-[var(--muted)] cursor-pointer">
                            {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2">
                      <button type="submit" disabled={saving}
                        className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors font-medium cursor-pointer">
                        {saving
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Shield size={15} />}
                        {saving ? "Changing..." : "Change Password"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === "notifs" && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] mb-5">
                    <Bell size={18} className="text-violet-600" />
                    <h3 className="font-semibold text-[var(--text)]">Notification Preferences</h3>
                  </div>

                  <div className="space-y-1 mb-6">
                    <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Channels</p>
                    <Toggle checked={notifs.emailEnabled} onChange={v => setNotifs(p => ({ ...p, emailEnabled: v }))} label="Email Notifications" desc="Receive notifications via email" />
                    <Toggle checked={notifs.smsEnabled}   onChange={v => setNotifs(p => ({ ...p, smsEnabled: v }))}   label="SMS Notifications"   desc="Receive notifications via SMS" />
                    <Toggle checked={notifs.pushEnabled}  onChange={v => setNotifs(p => ({ ...p, pushEnabled: v }))}  label="Push Notifications"  desc="In-app push notifications" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Events</p>
                    <Toggle checked={notifs.newMember}      onChange={v => setNotifs(p => ({ ...p, newMember: v }))}      label="New Member Joined"      desc="When a new member registers" />
                    <Toggle checked={notifs.paymentSuccess} onChange={v => setNotifs(p => ({ ...p, paymentSuccess: v }))} label="Payment Received"        desc="When a payment is processed" />
                    <Toggle checked={notifs.expiryReminder} onChange={v => setNotifs(p => ({ ...p, expiryReminder: v }))} label="Membership Expiry Alert" desc="Before a membership expires" />
                    <Toggle checked={notifs.dailyReport}    onChange={v => setNotifs(p => ({ ...p, dailyReport: v }))}    label="Daily Summary Report"   desc="Daily platform activity summary" />
                  </div>
                </div>
              )}

              {/* Save button (not shown for security tab — it has its own submit) */}
              {activeTab !== "security" && (
                <div className="flex justify-end">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors font-medium cursor-pointer">
                    {saving
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : saved ? <Check size={15} /> : <Save size={15} />}
                    {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
