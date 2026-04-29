"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { User, Bell, CreditCard, Save, Clock } from "lucide-react";

export default function Page() {
  return (
    <RoleDashboardLayout title="Settings" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Settings</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Manage your gym profile and preferences</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 h-fit">
            {[{ icon: User, label: "Gym Profile" }, { icon: Clock, label: "Timings" }, { icon: Bell, label: "Notifications" }, { icon: CreditCard, label: "Billing" }].map(({ icon: Icon, label }, i) => (
              <button key={label} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${i === 0 ? "bg-blue-600 text-white" : "text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"}`}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
          <div className="xl:col-span-3 space-y-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Gym Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Gym Name",    value: "Iron Paradise Fitness",  type: "text" },
                  { label: "Owner Name",  value: "Suresh Nair",            type: "text" },
                  { label: "Email",       value: "suresh@ironparadise.in", type: "email" },
                  { label: "Phone",       value: "+91 98765 43210",        type: "tel" },
                  { label: "GST Number",  value: "27AABCU9603R1ZX",        type: "text" },
                  { label: "City",        value: "Mumbai",                 type: "text" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">{f.label}</label>
                    <input type={f.type} defaultValue={f.value} className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Address</label>
                <textarea rows={2} defaultValue="Shop 12, Fitness Complex, Andheri West, Mumbai – 400058" className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Gym Timings</h3>
              <div className="space-y-3">
                {[
                  { day: "Monday – Friday", open: "05:00", close: "23:00" },
                  { day: "Saturday",        open: "06:00", close: "22:00" },
                  { day: "Sunday",          open: "07:00", close: "21:00" },
                ].map((t) => (
                  <div key={t.day} className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-sm text-[var(--text)] w-40 flex-shrink-0">{t.day}</span>
                    <div className="flex items-center gap-2">
                      <input type="time" defaultValue={t.open} className="px-3 py-1.5 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                      <span className="text-[var(--muted)] text-sm">to</span>
                      <input type="time" defaultValue={t.close} className="px-3 py-1.5 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <Save size={15} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
