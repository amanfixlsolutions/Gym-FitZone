"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Lock, Bell, Shield, Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { authAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";

export default function SettingsPage() {
  const { user, loaded, logoutUser } = useAuth();
  const router = useRouter();

  const [pwForm,    setPwForm]    = useState({ current: "", newPw: "", confirm: "" });
  const [showPw,    setShowPw]    = useState({ current: false, newPw: false, confirm: false });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

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
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.message || "Failed to change password");
      showError(err.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  if (!loaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const toggle = (field) => setShowPw(p => ({ ...p, [field]: !p[field] }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences</p>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Lock size={18} className="text-amber-600" />
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
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                  />
                  <button type="button" onClick={() => toggle(f.key)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}

            <button type="submit" disabled={pwSaving}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
              {pwSaving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              {pwSaving ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell size={18} className="text-blue-600" />
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
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{n.label}</p>
                  <p className="text-xs text-gray-500">{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Account</h2>
              <p className="text-xs text-gray-500">Manage your account</p>
            </div>
          </div>
          <button
            onClick={async () => { await logoutUser(); router.push("/login"); }}
            className="w-full py-2.5 border-2 border-red-200 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
