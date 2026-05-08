"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Lock, Bell, Shield, Eye, EyeOff, Loader2, Check, AlertCircle, LogOut, CreditCard, Clock } from "lucide-react";
import { authAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import Link from "next/link";

const BG = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80";

export default function SettingsPage() {
  const { user, loaded, logoutUser } = useAuth();
  const router = useRouter();

  const [pwForm,    setPwForm]    = useState({ current: "", newPw: "", confirm: "" });
  const [showPw,    setShowPw]    = useState({ current: false, newPw: false, confirm: false });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (loaded && !user) router.push("/login");
  }, [loaded, user, router]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    if (pwForm.newPw.length < 6)         { setPwError("Password must be at least 6 characters."); return; }
    setPwSaving(true); setPwError("");
    try {
      await authAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwSuccess(true);
      setPwForm({ current: "", newPw: "", confirm: "" });
      showSuccess("Password changed successfully!");
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      setPwError(err.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  if (!loaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const toggle = (field) => setShowPw(p => ({ ...p, [field]: !p[field] }));

  const planExpiry = user.planExpiry
    ? new Date(user.planExpiry).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen pb-12" style={{ backgroundImage: `url('${BG}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="min-h-screen" style={{ background: "rgba(0,0,0,0.68)" }}>
        <div className="container mx-auto px-4 max-w-2xl pt-24 space-y-4">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-white">Settings</h1>
            <p className="text-sm text-white/60 mt-0.5">Manage your account preferences</p>
          </div>

          {/* Membership Plan */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Membership Plan</h2>
                <p className="text-xs text-gray-500">Your current subscription</p>
              </div>
            </div>
            {user.plan ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">{user.plan}</p>
                  {planExpiry && (
                    <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> Expires {planExpiry}
                    </p>
                  )}
                </div>
                <Link href="/membership"
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                  Upgrade →
                </Link>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">No active plan</p>
                <Link href="/membership"
                  className="text-xs font-bold text-amber-600 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                  Get a Plan →
                </Link>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Change Password</h2>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
            </div>

            {pwSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4">
                <Check size={15} /> Password changed successfully!
              </div>
            )}
            {pwError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                <AlertCircle size={15} /> {pwError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { key: "current", label: "Current Password",  placeholder: "Enter current password" },
                { key: "newPw",   label: "New Password",      placeholder: "Min. 6 characters" },
                { key: "confirm", label: "Confirm Password",  placeholder: "Re-enter new password" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPw[f.key] ? "text" : "password"}
                      placeholder={f.placeholder}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                    <button type="button" onClick={() => toggle(f.key)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}

              <button type="submit" disabled={pwSaving}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                {pwSaving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                {pwSaving ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Notifications</h2>
                <p className="text-xs text-gray-500">Manage your notification preferences</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Class reminders",       desc: "Get notified before your booked classes" },
                { label: "Membership expiry",     desc: "Alerts when your plan is about to expire" },
                { label: "New classes available", desc: "When new classes are scheduled" },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-gray-800">{n.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Account</h2>
                <p className="text-xs text-gray-500">Sign out of your account</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
