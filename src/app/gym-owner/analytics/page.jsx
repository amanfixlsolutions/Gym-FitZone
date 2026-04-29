"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import RevenueChart from "@/components/RevenueChart";
import AttendanceChart from "@/components/AttendanceChart";
import RetentionGauge from "@/components/RetentionGauge";
import PlanDistribution from "@/components/PlanDistribution";
import { TrendingUp, Users, CreditCard, BarChart3 } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";

export default function Page() {
  return (
    <RoleDashboardLayout title="Analytics" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Analytics</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Iron Paradise Fitness — performance insights</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Monthly Revenue", value: "₹1.24L", change: "+8.1%",  icon: CreditCard },
            { label: "Active Members",  value: "2,310",  change: "+12.3%", icon: Users },
            { label: "Avg Check-ins",   value: "128/day",change: "+5.2%",  icon: TrendingUp },
            { label: "Retention Rate",  value: "88%",    change: "+2.1%",  icon: BarChart3 },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                <s.icon size={16} className="text-blue-600" />
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
            <p className="text-sm font-semibold text-[var(--text)] mb-4">Member Churn Reasons</p>
            <div className="space-y-3">
              {[
                { reason: "Price too high",  pct: 34, color: "bg-red-500" },
                { reason: "Moved location",  pct: 22, color: "bg-amber-500" },
                { reason: "Gym quality",     pct: 18, color: "bg-orange-500" },
                { reason: "Health reasons",  pct: 14, color: "bg-blue-500" },
                { reason: "Other",           pct: 12, color: "bg-gray-400" },
              ].map((item) => (
                <div key={item.reason} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text)] w-32 flex-shrink-0">{item.reason}</span>
                  <div className="flex-1 bg-[var(--surface2)] rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-[var(--text)] w-8 text-right">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
