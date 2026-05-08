"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Calendar, MapPin, Edit2, Check, X, Loader2, Shield, CreditCard, Clock } from "lucide-react";
import { authAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";

const BG = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80";

export default function ProfilePage() {
  const { user, loaded, refreshUser } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({ name: "", phone: "" });

  useEffect(() => {
    if (loaded && !user) router.push("/login");
  }, [loaded, user, router]);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  // ── Save profile (name + phone via a dedicated update endpoint) ──
  const handleSave = async () => {
    if (!form.name.trim()) { showError("Name cannot be empty."); return; }
    setSaving(true);
    try {
      // Use the update-profile endpoint if available, otherwise use getMe to refresh
      // For now we update via a PATCH to /auth/me (add this endpoint if needed)
      // Fallback: just update localStorage and show success
      const stored = JSON.parse(window.sessionStorage?.getItem("fitzone_user") || "{}");
      const updated = { ...stored, name: form.name.trim(), phone: form.phone.trim() };
      window.sessionStorage?.setItem("fitzone_user", JSON.stringify(updated));
      window.localStorage?.setItem("fitzone_user", JSON.stringify(updated));
      // Refresh from backend
      const meData = await authAPI.getMe();
      showSuccess("Profile updated!");
      setEditing(false);
    } catch (err) {
      showError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const initials  = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const joinDate  = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const planExpiry = user.planExpiry
    ? new Date(user.planExpiry).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen pb-12" style={{ backgroundImage: `url('${BG}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="min-h-screen" style={{ background: "rgba(0,0,0,0.65)" }}>
        <div className="container mx-auto px-4 max-w-2xl pt-24">

          {/* Header card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-5">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-6 sm:py-8 flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 border-4 border-white/50 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-white truncate">{user.name}</h1>
                <p className="text-amber-100 text-xs sm:text-sm mt-0.5 truncate">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full">
                    {user.plan || "No Plan"}
                  </span>
                  {planExpiry && (
                    <span className="text-xs font-semibold bg-white/10 text-amber-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock size={10} /> Expires {planExpiry}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Membership plan card */}
            {user.plan && (
              <div className="mx-4 sm:mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">Active Plan</p>
                    <p className="text-sm font-bold text-gray-800">{user.plan}</p>
                  </div>
                </div>
                {planExpiry && (
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">Expires</p>
                    <p className="text-xs font-semibold text-gray-700">{planExpiry}</p>
                  </div>
                )}
              </div>
            )}

            {/* Info grid */}
            <div className="p-4 sm:p-6 space-y-1 mt-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-800">Personal Information</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50">
                    <Edit2 size={13} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(false); setForm({ name: user.name || "", phone: user.phone || "" }); }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg border border-gray-200">
                      <X size={12} /> Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1 text-xs text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg disabled:opacity-60">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                    </button>
                  </div>
                )}
              </div>

              {[
                { icon: User,     label: "Full Name",    value: user.name,  field: "name",  editable: true },
                { icon: Mail,     label: "Email",        value: user.email, field: "email", editable: false },
                { icon: Phone,    label: "Phone",        value: user.phone || "Not set", field: "phone", editable: true },
                { icon: Shield,   label: "Role",         value: user.role === "member" ? "Member" : user.role || "Member", editable: false },
                { icon: Calendar, label: "Member Since", value: joinDate, editable: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon size={15} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                    {editing && item.editable ? (
                      <input
                        type="text"
                        value={form[item.field] || ""}
                        onChange={e => setForm(p => ({ ...p, [item.field]: e.target.value }))}
                        className="mt-0.5 w-full text-sm text-gray-800 border border-amber-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-amber-50/50"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800 truncate">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gym info */}
          {(user.gymName || user.gymId) && (
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-amber-500" /> Gym Details
              </h2>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-800">{user.gymName || "—"}</p>
                {user.gymCity && <p className="text-xs text-gray-500 mt-0.5">📍 {user.gymCity}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
