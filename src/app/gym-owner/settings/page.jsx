"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { useAuth } from "@/context/AuthContext";
import { settingsAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import {
  User, Bell, CreditCard, Save, Clock, RefreshCw,
  AlertCircle, Check, Building2, Mail, Phone, Globe,
  ToggleLeft, ToggleRight, ChevronRight,
} from "lucide-react";

const TABS = [
  { id: "profile",       label: "Gym Profile",    icon: User },
  { id: "timings",       label: "Timings",         icon: Clock },
  { id: "notifications", label: "Notifications",   icon: Bell },
  { id: "billing",       label: "Billing",         icon: CreditCard },
];

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_LABELS = { monday:"Monday", tuesday:"Tuesday", wednesday:"Wednesday", thursday:"Thursday", friday:"Friday", saturday:"Saturday", sunday:"Sunday" };

const inputCls = "w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";
const labelCls = "text-xs font-medium text-[var(--muted)] block mb-1.5";

export default function Page() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [settings,  setSettings]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [errors,    setErrors]    = useState({});

  // ── Local form state ───────────────────────────────────────────
  const [profile, setProfile] = useState({
    gymName: "", ownerName: "", email: "", phone: "",
    address: "", city: "", gstNumber: "", website: "", description: "",
    currency: "INR", taxRate: 18, autoInvoice: true, autoReminder: true, reminderDays: 7,
  });

  const [timings, setTimings] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: { open: "06:00", close: "22:00", closed: false } }), {})
  );

  const [notifs, setNotifs] = useState({
    emailEnabled: true, smsEnabled: false, pushEnabled: true,
    newMember: true, paymentSuccess: true, expiryReminder: true,
    classReminder: true, lowInventory: true, dailyReport: false,
  });

  const [billing, setBilling] = useState({
    planName: "Basic", billingCycle: "monthly", autoRenew: true,
    nextBillingDate: "", paymentMethod: "", cardLast4: "",
  });

  // ── Fetch settings ─────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.get();
      const s = res.data;
      setSettings(s);

      if (s.gym_settings) {
        setProfile(prev => ({ ...prev, ...s.gym_settings }));
      }
      if (s.timings) {
        setTimings(prev => {
          const updated = { ...prev };
          DAYS.forEach(d => {
            if (s.timings[d]) updated[d] = { ...prev[d], ...s.timings[d] };
          });
          return updated;
        });
      }
      if (s.notifications) setNotifs(prev => ({ ...prev, ...s.notifications }));
      if (s.billing)       setBilling(prev => ({ ...prev, ...s.billing }));
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Validate profile ───────────────────────────────────────────
  const validateProfile = () => {
    const e = {};
    if (!profile.gymName?.trim())  e.gymName  = "Gym name is required";
    if (!profile.email?.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(profile.email)) e.email = "Invalid email format";
    if (!profile.phone?.trim())    e.phone    = "Phone is required";
    if (profile.taxRate < 0 || profile.taxRate > 100) e.taxRate = "Tax rate must be 0–100";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (activeTab === "profile" && !validateProfile()) return;

    setSaving(true);
    try {
      const payload = {};
      if (activeTab === "profile")       payload.gym_settings = profile;
      if (activeTab === "timings")       payload.timings      = timings;
      if (activeTab === "notifications") payload.notifications = notifs;
      if (activeTab === "billing")       payload.billing      = billing;

      await settingsAPI.update(payload);
      setSaved(true);
      showSuccess("Settings saved successfully!");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      showError(err.message || "Failed to save settings");
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
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${checked ? "bg-blue-600" : "bg-[var(--border)]"}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );

  return (
    <RoleDashboardLayout title="Settings" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Settings</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage your gym profile and preferences</p>
          </div>
          <button onClick={fetchSettings} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors" title="Refresh">
            <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

            {/* Sidebar tabs */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 h-fit">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setErrors({}); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === id ? "bg-blue-600 text-white" : "text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"}`}
                >
                  <Icon size={15} />
                  <span className="flex-1 text-left">{label}</span>
                  {activeTab !== id && <ChevronRight size={13} className="opacity-40" />}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="xl:col-span-3 space-y-4">

              {/* ── GYM PROFILE ── */}
              {activeTab === "profile" && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                    <Building2 size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-[var(--text)]">Gym Profile</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Gym Name <span className="text-red-500">*</span></label>
                      <input type="text" value={profile.gymName} onChange={e => setProfile(p => ({ ...p, gymName: e.target.value }))} placeholder="Iron Paradise Fitness" className={inputCls} />
                      {errors.gymName && <p className="text-xs text-red-500 mt-1">{errors.gymName}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Owner Name</label>
                      <input type="text" value={profile.ownerName} onChange={e => setProfile(p => ({ ...p, ownerName: e.target.value }))} placeholder="Suresh Nair" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                      <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="gym@example.com" className={inputCls} />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Phone <span className="text-red-500">*</span></label>
                      <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" className={inputCls} />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>GST Number</label>
                      <input type="text" value={profile.gstNumber} onChange={e => setProfile(p => ({ ...p, gstNumber: e.target.value }))} placeholder="27AABCU9603R1ZX" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>City</label>
                      <input type="text" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Website</label>
                      <input type="url" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yourgyms.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Tax Rate (%)</label>
                      <input type="number" min="0" max="100" value={profile.taxRate} onChange={e => setProfile(p => ({ ...p, taxRate: Number(e.target.value) }))} className={inputCls} />
                      {errors.taxRate && <p className="text-xs text-red-500 mt-1">{errors.taxRate}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Address</label>
                    <textarea rows={2} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="Shop 12, Fitness Complex, Andheri West, Mumbai – 400058" className={`${inputCls} resize-none`} />
                  </div>

                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea rows={3} value={profile.description} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of your gym..." className={`${inputCls} resize-none`} />
                  </div>

                  {/* Billing preferences */}
                  <div className="pt-3 border-t border-[var(--border)]">
                    <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Billing Preferences</h4>
                    <div className="space-y-1">
                      <Toggle
                        checked={profile.autoInvoice}
                        onChange={v => setProfile(p => ({ ...p, autoInvoice: v }))}
                        label="Auto-generate invoices"
                        desc="Automatically create invoices on payment"
                      />
                      <Toggle
                        checked={profile.autoReminder}
                        onChange={v => setProfile(p => ({ ...p, autoReminder: v }))}
                        label="Membership expiry reminders"
                        desc={`Send reminder ${profile.reminderDays} days before expiry`}
                      />
                    </div>
                    {profile.autoReminder && (
                      <div className="mt-3">
                        <label className={labelCls}>Reminder days before expiry</label>
                        <input type="number" min="1" max="30" value={profile.reminderDays} onChange={e => setProfile(p => ({ ...p, reminderDays: Number(e.target.value) }))} className={`${inputCls} w-32`} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TIMINGS ── */}
              {activeTab === "timings" && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] mb-5">
                    <Clock size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-[var(--text)]">Gym Timings</h3>
                  </div>
                  <div className="space-y-4">
                    {DAYS.map(day => (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-[var(--border)] last:border-0">
                        <div className="flex items-center justify-between sm:w-36">
                          <span className="text-sm font-medium text-[var(--text)] capitalize">{DAY_LABELS[day]}</span>
                          <button
                            type="button"
                            onClick={() => setTimings(p => ({ ...p, [day]: { ...p[day], closed: !p[day].closed } }))}
                            className={`sm:hidden text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer ${timings[day].closed ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
                          >
                            {timings[day].closed ? "Closed" : "Open"}
                          </button>
                        </div>

                        {timings[day].closed ? (
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-sm text-red-500 font-medium">Closed</span>
                            <button type="button" onClick={() => setTimings(p => ({ ...p, [day]: { ...p[day], closed: false } }))} className="text-xs text-blue-600 hover:underline cursor-pointer">Set hours</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="time"
                              value={timings[day].open}
                              onChange={e => setTimings(p => ({ ...p, [day]: { ...p[day], open: e.target.value } }))}
                              className="px-3 py-1.5 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                            />
                            <span className="text-[var(--muted)] text-sm">to</span>
                            <input
                              type="time"
                              value={timings[day].close}
                              onChange={e => setTimings(p => ({ ...p, [day]: { ...p[day], close: e.target.value } }))}
                              className="px-3 py-1.5 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => setTimings(p => ({ ...p, [day]: { ...p[day], closed: true } }))}
                              className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer whitespace-nowrap"
                            >
                              Mark closed
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick presets */}
                  <div className="mt-5 pt-4 border-t border-[var(--border)]">
                    <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Quick Presets</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { label: "Standard (6AM–10PM)", open: "06:00", close: "22:00" },
                        { label: "Extended (5AM–11PM)", open: "05:00", close: "23:00" },
                        { label: "24/7",                open: "00:00", close: "23:59" },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setTimings(DAYS.reduce((acc, d) => ({ ...acc, [d]: { open: preset.open, close: preset.close, closed: false } }), {}))}
                          className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === "notifications" && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] mb-5">
                    <Bell size={18} className="text-blue-600" />
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
                    <Toggle checked={notifs.newMember}      onChange={v => setNotifs(p => ({ ...p, newMember: v }))}      label="New Member Joined"       desc="When a new member registers" />
                    <Toggle checked={notifs.paymentSuccess} onChange={v => setNotifs(p => ({ ...p, paymentSuccess: v }))} label="Payment Received"         desc="When a payment is processed" />
                    <Toggle checked={notifs.expiryReminder} onChange={v => setNotifs(p => ({ ...p, expiryReminder: v }))} label="Membership Expiry Alert"  desc="Before a membership expires" />
                    <Toggle checked={notifs.classReminder}  onChange={v => setNotifs(p => ({ ...p, classReminder: v }))}  label="Class Reminders"          desc="Before scheduled classes" />
                    <Toggle checked={notifs.lowInventory}   onChange={v => setNotifs(p => ({ ...p, lowInventory: v }))}   label="Low Inventory Alert"      desc="When stock falls below minimum" />
                    <Toggle checked={notifs.dailyReport}    onChange={v => setNotifs(p => ({ ...p, dailyReport: v }))}    label="Daily Summary Report"     desc="Daily gym activity summary" />
                  </div>
                </div>
              )}

              {/* ── BILLING ── */}
              {activeTab === "billing" && (
                <div className="space-y-4">
                  {/* Current plan */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Current Plan</p>
                        <p className="text-2xl font-black mt-1">{billing.planName || "Basic"}</p>
                        <p className="text-blue-200 text-sm mt-1">
                          Billed {billing.billingCycle === "yearly" ? "yearly" : "monthly"}
                          {billing.nextBillingDate && ` · Next: ${new Date(billing.nextBillingDate).toLocaleDateString("en-IN")}`}
                        </p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-3 text-center">
                        <CreditCard size={28} className="text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                      <CreditCard size={18} className="text-blue-600" />
                      <h3 className="font-semibold text-[var(--text)]">Billing Settings</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Billing Cycle</label>
                        <select value={billing.billingCycle} onChange={e => setBilling(p => ({ ...p, billingCycle: e.target.value }))} className={inputCls}>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly (Save 20%)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Payment Method</label>
                        <input type="text" value={billing.paymentMethod} onChange={e => setBilling(p => ({ ...p, paymentMethod: e.target.value }))} placeholder="Credit Card / UPI / Bank Transfer" className={inputCls} />
                      </div>
                      {billing.cardLast4 && (
                        <div>
                          <label className={labelCls}>Card on File</label>
                          <input type="text" value={`•••• •••• •••• ${billing.cardLast4}`} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
                        </div>
                      )}
                    </div>

                    <Toggle
                      checked={billing.autoRenew}
                      onChange={v => setBilling(p => ({ ...p, autoRenew: v }))}
                      label="Auto-renew subscription"
                      desc="Automatically renew before expiry"
                    />

                    {/* Plan options */}
                    <div className="pt-3 border-t border-[var(--border)]">
                      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Available Plans</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { name: "Basic",        price: "₹999/mo",  features: ["Up to 100 members", "Basic analytics", "Email support"] },
                          { name: "Professional", price: "₹2,499/mo", features: ["Unlimited members", "Advanced analytics", "Priority support", "Zoom classes"], popular: true },
                          { name: "Enterprise",   price: "₹4,999/mo", features: ["Multi-gym", "Custom branding", "Dedicated manager", "API access"] },
                        ].map(plan => (
                          <div
                            key={plan.name}
                            onClick={() => setBilling(p => ({ ...p, planName: plan.name }))}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${billing.planName === plan.name ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-[var(--border)] hover:border-blue-300"} ${plan.popular ? "relative" : ""}`}
                          >
                            {plan.popular && (
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                                POPULAR
                              </span>
                            )}
                            <p className="font-bold text-[var(--text)] text-sm">{plan.name}</p>
                            <p className="text-blue-600 font-semibold text-xs mt-0.5">{plan.price}</p>
                            <ul className="mt-2 space-y-1">
                              {plan.features.map(f => (
                                <li key={f} className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
                                  <Check size={10} className="text-emerald-500 flex-shrink-0" />{f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium cursor-pointer"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : saved ? (
                    <Check size={15} />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleDashboardLayout>
  );
}
