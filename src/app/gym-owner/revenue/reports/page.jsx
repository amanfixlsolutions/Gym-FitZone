"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import RevenueChart from "@/components/RevenueChart";
import { Download, PieChart } from "lucide-react";

export default function Page() {
  return (
    <RoleDashboardLayout title="Reports" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Revenue Reports</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Download and analyse your gym's financial data</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-fit"><Download size={15} /> Download PDF</button>
        </div>
        <RevenueChart />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Monthly Report – Jan 2025", desc: "Full breakdown", size: "1.8 MB" },
            { label: "Quarterly – Q4 2024",       desc: "Oct to Dec",    size: "3.2 MB" },
            { label: "Annual Report 2024",         desc: "Full year",     size: "6.4 MB" },
          ].map((r) => (
            <div key={r.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-3">
                <PieChart size={20} className="text-blue-600" />
              </div>
              <p className="font-semibold text-[var(--text)]">{r.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{r.desc}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-[var(--muted2)]">{r.size} · PDF</span>
                <button className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700"><Download size={13} /> Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
