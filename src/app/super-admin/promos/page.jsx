"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { Tag, Plus, Copy, Trash2, Edit2, TrendingUp } from "lucide-react";

const promos = [
  { code: "FITZONE50",  discount: "50% off",  type: "Percentage", minOrder: "₹500",  usage: 1240, limit: 5000, expires: "Feb 28, 2025", active: true },
  { code: "NEWYEAR25",  discount: "25% off",  type: "Percentage", minOrder: "₹0",    usage: 890,  limit: 2000, expires: "Jan 31, 2025", active: false },
  { code: "FIRSTGYM",   discount: "₹500 off", type: "Flat",       minOrder: "₹1,000",usage: 3420, limit: 10000,expires: "Mar 31, 2025", active: true },
  { code: "SUMMER30",   discount: "30% off",  type: "Percentage", minOrder: "₹800",  usage: 210,  limit: 1000, expires: "Apr 30, 2025", active: true },
  { code: "REFER200",   discount: "₹200 off", type: "Flat",       minOrder: "₹0",    usage: 5600, limit: 99999,expires: "Dec 31, 2025", active: true },
];

export default function Page() {
  return (
    <RoleDashboardLayout title="Promo Codes" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Promo Codes</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Manage global discount codes and offers</p>
          </div>
          <button className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm w-fit">
            <Plus size={15} /> Create Promo
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: "Total Codes", value: "5" }, { label: "Active", value: "4" }, { label: "Total Uses", value: "11,360" }, { label: "Revenue Saved", value: "₹8.2L" }].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {promos.map((p) => {
            const pct = Math.round((p.usage / p.limit) * 100);
            return (
              <div key={p.code} className={`bg-[var(--surface)] border-2 rounded-xl p-5 hover:shadow-md transition-shadow ${p.active ? "border-[var(--border)]" : "border-[var(--border)] opacity-60"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                      <Tag size={16} className="text-violet-600" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-[var(--text)]">{p.code}</p>
                      <p className="text-xs text-[var(--muted)]">{p.type} discount</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                    {p.active ? "Active" : "Expired"}
                  </span>
                </div>

                <p className="text-2xl font-black text-[var(--text)] mb-1">{p.discount}</p>
                <p className="text-xs text-[var(--muted)] mb-3">Min order: {p.minOrder} · Expires: {p.expires}</p>

                {/* Usage bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
                    <span className="flex items-center gap-1"><TrendingUp size={11} /> {p.usage.toLocaleString()} / {p.limit === 99999 ? "∞" : p.limit.toLocaleString()} uses</span>
                    <span className="font-semibold text-[var(--text)]">{p.limit === 99999 ? "—" : `${pct}%`}</span>
                  </div>
                  {p.limit !== 99999 && (
                    <div className="h-1.5 bg-[var(--surface2)] rounded-full">
                      <div className="h-1.5 bg-violet-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-[var(--surface2)] text-[var(--text)] rounded-lg hover:bg-[var(--border)] transition-colors">
                    <Copy size={12} /> Copy
                  </button>
                  <button className="p-2 border border-[var(--border)] rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[var(--muted)] hover:text-blue-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button className="p-2 border border-[var(--border)] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--muted)] hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
