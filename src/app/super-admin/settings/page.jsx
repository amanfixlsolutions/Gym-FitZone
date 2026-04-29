"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { User, Shield, Bell, CreditCard, Save, Globe } from "lucide-react";

export default function Page() {
  return (
    <RoleDashboardLayout title="Settings" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Settings</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Manage your account and platform preferences</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Sidebar tabs */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 h-fit">
            {[
              { icon: User,       label: "Profile" },
              { icon: Shield,     label: "Security" },
              { icon: Bell,       label: "Notifications" },
              { icon: CreditCard, label: "Billing" },
              { icon: Globe,      label: "Platform" },
            ].map(({ icon: Icon, label }, i) => (
              <button key={label} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${i === 0 ? "bg-violet-600 text-white" : "text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"}`}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="xl:col-span-3 space-y-4">
            {/* Profile */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 sm:p-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Profile Information</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  RS
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)]">Rajiv Sharma</p>
                  <p className="text-sm text-[var(--muted)]">admin@fitzone.in</p>
                  <button className="mt-1 text-xs text-violet-600 font-medium hover:text-violet-700">Change photo</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "First Name",  value: "Rajiv",            type: "text" },
                  { label: "Last Name",   value: "Sharma",           type: "text" },
                  { label: "Email",       value: "admin@fitzone.in", type: "email" },
                  { label: "Phone",       value: "+91 98765 43210",  type: "tel" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">{f.label}</label>
                    <input type={f.type} defaultValue={f.value} className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Platform settings */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 sm:p-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Platform Settings</h3>
              <div className="space-y-4">
                {[
                  { label: "Platform Commission (%)",   value: "10",  desc: "Percentage taken from each transaction" },
                  { label: "Max Pause Duration (days)", value: "60",  desc: "Maximum days a member can pause membership" },
                  { label: "Referral Bonus (₹)",        value: "200", desc: "Reward per successful referral" },
                  { label: "Featured Listing Fee (₹)",  value: "4999",desc: "Monthly charge for sponsored gym listings" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[var(--border)] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{s.label}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{s.desc}</p>
                    </div>
                    <input type="text" defaultValue={s.value} className="w-full sm:w-24 px-3 py-1.5 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] text-center focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 sm:p-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Security</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Confirm Password</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-lg hover:bg-violet-700 transition-colors font-medium">
                <Save size={15} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
