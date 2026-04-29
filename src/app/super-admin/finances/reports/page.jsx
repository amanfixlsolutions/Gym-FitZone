"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import RevenueChart from "@/components/RevenueChart";
import { Download, PieChart } from "lucide-react";

export default function Page() {
  return (
    <RoleDashboardLayout title="Reports" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Financial Reports</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform revenue analytics and downloadable reports</p>
          </div>
          <button className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm w-fit"><Download size={15} /> Download PDF</button>
        </div>
        <RevenueChart />
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <p className="font-semibold text-[var(--text)] mb-4">Revenue Breakdown by Plan Type</p>
          <div className="space-y-3">
            {[
              { label: "Yearly Memberships",    value: "₹12.4L", pct: 44 },
              { label: "Quarterly Memberships", value: "₹8.2L",  pct: 29 },
              { label: "Monthly Memberships",   value: "₹5.1L",  pct: 18 },
              { label: "Class Passes",          value: "₹1.8L",  pct: 6 },
              { label: "Day Passes",            value: "₹0.8L",  pct: 3 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm text-[var(--text)] w-48 flex-shrink-0">{item.label}</span>
                <div className="flex-1 bg-[var(--surface2)] rounded-full h-2">
                  <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-sm font-semibold text-[var(--text)] w-16 text-right">{item.value}</span>
                <span className="text-xs text-[var(--muted)] w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Monthly Report – Jan 2025", desc: "Full platform breakdown", size: "2.4 MB" },
            { label: "Quarterly – Q4 2024",       desc: "Oct to Dec",             size: "4.1 MB" },
            { label: "Annual Report 2024",         desc: "Full year overview",     size: "8.7 MB" },
          ].map((r) => (
            <div key={r.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/20 rounded-xl flex items-center justify-center mb-3">
                <PieChart size={20} className="text-violet-600" />
              </div>
              <p className="font-semibold text-[var(--text)]">{r.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{r.desc}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-[var(--muted2)]">{r.size} · PDF</span>
                <button className="flex items-center gap-1.5 text-xs text-violet-600 font-medium hover:text-violet-700"><Download size={13} /> Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
