"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import RevenueChart from "@/components/RevenueChart";
import AttendanceChart from "@/components/AttendanceChart";
import RetentionGauge from "@/components/RetentionGauge";
import PlanDistribution from "@/components/PlanDistribution";
import { TrendingUp, Users, Building2, BarChart3, Download } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";

export default function Page() {
  return (
    <RoleDashboardLayout title="Platform Analytics" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Platform Analytics</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform-wide metrics, growth charts and retention curves</p>
          </div>
          <button className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm w-fit"><Download size={15} /> Export Report</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Platform GMV",      value: "₹2.83Cr", change: "+18.4%", icon: TrendingUp },
            { label: "Total Users",       value: "16,431",  change: "+15.5%", icon: Users },
            { label: "Active Gyms",       value: "6,225",   change: "+8.4%",  icon: Building2 },
            { label: "Avg Revenue/Gym",   value: "₹45,480", change: "+9.1%",  icon: BarChart3 },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center mb-3">
                <s.icon size={16} className="text-violet-600" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
              <span className="text-xs font-semibold text-emerald-600 mt-1 inline-block">{s.change}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><RevenueChart /></div>
          <div className="flex flex-col gap-4">
            <AttendanceChart />
            <RetentionGauge />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <PlanDistribution />
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <p className="text-sm font-semibold text-[var(--text)] mb-4">Top Cities by Revenue</p>
            <div className="space-y-3">
              {[
                { city: "Mumbai",    revenue: "₹8.2L", pct: 29 },
                { city: "Bangalore", revenue: "₹6.4L", pct: 23 },
                { city: "Delhi",     revenue: "₹5.1L", pct: 18 },
                { city: "Hyderabad", revenue: "₹3.8L", pct: 13 },
                { city: "Pune",      revenue: "₹2.9L", pct: 10 },
                { city: "Others",    revenue: "₹2.0L", pct: 7 },
              ].map((item) => (
                <div key={item.city} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text)] w-24 flex-shrink-0">{item.city}</span>
                  <div className="flex-1 bg-[var(--surface2)] rounded-full h-2">
                    <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)] w-14 text-right">{item.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
