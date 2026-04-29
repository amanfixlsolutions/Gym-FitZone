"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { Percent, Save, Star, Megaphone } from "lucide-react";

export default function Page() {
  return (
    <RoleDashboardLayout title="Platform Config" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Platform Configuration</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Global settings, commission rates and featured listings</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Commission */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                <Percent size={16} className="text-violet-600" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Commission Settings</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Platform Commission (%)", value: "10", desc: "Taken from each transaction" },
                { label: "Referral Bonus (₹)",      value: "200", desc: "Reward per successful referral" },
                { label: "Featured Listing Fee (₹/month)", value: "4999", desc: "Charge for sponsored listings" },
              ].map((s) => (
                <div key={s.label}>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">{s.label}</label>
                  <input defaultValue={s.value} className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  <p className="text-xs text-[var(--muted2)] mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Platform toggles */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="font-semibold text-[var(--text)] mb-5">Platform Toggles</h3>
            <div className="space-y-4">
              {[
                { label: "Gym Approval Required",  desc: "New gyms need super admin approval", on: true },
                { label: "User Registration Open", desc: "Allow new user sign-ups",             on: true },
                { label: "Razorpay Payments",      desc: "Enable payment gateway",              on: true },
                { label: "AI Recommendations",     desc: "Show AI-powered gym suggestions",     on: false },
                { label: "Community Feed",         desc: "Enable member community posts",       on: true },
                { label: "Maintenance Mode",       desc: "Take platform offline",               on: false },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{t.label}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{t.desc}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${t.on ? "bg-violet-600" : "bg-[var(--border)]"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${t.on ? "left-6" : "left-1"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured gyms */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <Star size={16} className="text-amber-600" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Featured / Sponsored Gyms</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "Iron Paradise Fitness", city: "Mumbai",    expires: "Feb 28, 2025" },
                { name: "PowerHouse Gym",         city: "Bangalore", expires: "Mar 15, 2025" },
                { name: "FitLife Studio",         city: "Delhi",     expires: "Feb 10, 2025" },
              ].map((g) => (
                <div key={g.name} className="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{g.name}</p>
                    <p className="text-xs text-[var(--muted)]">{g.city} · Expires {g.expires}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <button className="text-xs text-red-500 hover:text-red-600 font-medium">Remove</button>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--muted)] hover:border-violet-400 hover:text-violet-600 transition-colors">
                + Add Featured Gym
              </button>
            </div>
          </div>

          {/* Promo codes */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <Megaphone size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-semibold text-[var(--text)]">Global Promo Codes</h3>
            </div>
            <div className="space-y-3">
              {[
                { code: "FITZONE50", discount: "50% off", usage: "1,240 used", expires: "Feb 28, 2025", active: true },
                { code: "NEWYEAR25", discount: "25% off", usage: "890 used",   expires: "Jan 31, 2025", active: false },
                { code: "FIRSTGYM",  discount: "₹500 off",usage: "3,420 used", expires: "Mar 31, 2025", active: true },
              ].map((p) => (
                <div key={p.code} className="flex items-center justify-between bg-[var(--surface2)] rounded-lg px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[var(--text)]">{p.code}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {p.active ? "Active" : "Expired"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{p.discount} · {p.usage} · Expires {p.expires}</p>
                  </div>
                  <button className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--muted)] hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                + Create Promo Code
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-lg hover:bg-violet-700 transition-colors font-medium">
            <Save size={15} /> Save All Changes
          </button>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
