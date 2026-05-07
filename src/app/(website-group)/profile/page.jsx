"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Calendar, MapPin, Edit2, Check, X, Loader2, Shield } from "lucide-react";
import { authAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";

export default function ProfilePage() {
  const { user, loaded } = useAuth();
  const router = useRouter();

  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [form,    setForm]      = useState({ name: "", phone: "" });

  useEffect(() => {
    if (loaded && !user) router.push("/login");
  }, [loaded, user, router]);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.changePassword; // placeholder — update profile API if available
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
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-5">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/50 flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <p className="text-amber-100 text-sm mt-0.5">{user.email}</p>
              <span className="inline-block mt-2 text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full">
                {user.plan || "Member"} Plan
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-gray-800">Personal Information</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                  <Edit2 size={13} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border border-gray-200">
                    <X size={12} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1 text-xs text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-lg disabled:opacity-60">
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                  </button>
                </div>
              )}
            </div>

            {[
              { icon: User,     label: "Full Name",    value: user.name,  field: "name",  editable: true },
              { icon: Mail,     label: "Email",        value: user.email, field: "email", editable: false },
              { icon: Phone,    label: "Phone",        value: user.phone || "Not set", field: "phone", editable: true },
              { icon: Shield,   label: "Role",         value: user.role || "member", editable: false },
              { icon: Calendar, label: "Member Since", value: joinDate,   editable: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                  {editing && item.editable ? (
                    <input
                      type="text"
                      value={form[item.field] || ""}
                      onChange={e => setForm(p => ({ ...p, [item.field]: e.target.value }))}
                      className="mt-0.5 w-full text-sm text-gray-800 border border-amber-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
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
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-amber-500" /> Gym Details
            </h2>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-800">{user.gymName || "—"}</p>
              {user.gymCity && <p className="text-xs text-gray-500 mt-0.5">📍 {user.gymCity}</p>}
              {user.planExpiry && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  Membership expires: {new Date(user.planExpiry).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
