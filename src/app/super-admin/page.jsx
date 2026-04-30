"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";
import AttendanceChart from "@/components/AttendanceChart";
import RetentionGauge from "@/components/RetentionGauge";
import TopGymsTable from "@/components/TopGymsTable";
import AIAssistant from "@/components/AIAssistant";
import RecentActivity from "@/components/RecentActivity";
import PlanDistribution from "@/components/PlanDistribution";
import { Users, Building2, CreditCard, Percent, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const stats = [
  { title: "Total Members",     value: "16,431", change: 15.5, icon: Users,     iconBg: "bg-violet-50 dark:bg-violet-900/20",  iconColor: "text-violet-600" },
  { title: "Active Gyms",       value: "6,225",  change: 8.4,  icon: Building2, iconBg: "bg-blue-50 dark:bg-blue-900/20",      iconColor: "text-blue-600" },
  { title: "Platform GMV",      value: "₹2.83Cr",change: 18.4, icon: CreditCard,iconBg: "bg-emerald-50 dark:bg-emerald-900/20",iconColor: "text-emerald-600" },
  { title: "Commission Earned", value: "₹28.3L", change: 18.4, icon: Percent,   iconBg: "bg-amber-50 dark:bg-amber-900/20",    iconColor: "text-amber-600" },
];

const pendingGyms = [
  { name: "Muscle Factory",  owner: "Deepak Joshi",  city: "Pune",    submitted: "Jan 27, 2025", docs: true },
  { name: "Alpha Fitness",   owner: "Pradeep Rao",   city: "Chennai", submitted: "Jan 26, 2025", docs: false },
  { name: "Flex Zone",       owner: "Anita Gupta",   city: "Jaipur",  submitted: "Jan 25, 2025", docs: true },
];

export default function SuperAdminDashboard() {
  return (
    <RoleDashboardLayout
      title="Super Admin Dashboard"
      navItems={SUPER_ADMIN_NAV}
      role="super-admin"
      userName="Rajiv Sharma"
      userEmail="admin@fitzone.in"
      userAvatar="RS"
    >
      <div className="space-y-5">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-200 text-sm font-medium mb-1">Welcome back, Rajiv 👋</p>
              <h1 className="text-2xl font-bold">Platform Overview</h1>
              <p className="text-violet-200 text-sm mt-1">
                <strong className="text-white">12 gyms</strong> pending approval ·{" "}
                <strong className="text-white">47 reports</strong> to review ·{" "}
                <strong className="text-white">10%</strong> commission rate
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {[{ v: "12", l: "Pending Gyms" }, { v: "47", l: "Open Reports" }, { v: "10%", l: "Commission" }].map((b) => (
                <div key={b.l} className="bg-white/10 rounded-xl p-3 text-center min-w-[72px]">
                  <p className="text-2xl font-black">{b.v}</p>
                  <p className="text-xs text-violet-200">{b.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Revenue + Right */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><RevenueChart /></div>
          <div className="flex flex-col gap-4">
            <AttendanceChart />
            <RetentionGauge />
          </div>
        </div>

        {/* Pending approvals */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <p className="font-semibold text-[var(--text)]">Pending Gym Approvals</p>
              <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">12 waiting</span>
            </div>
            <Link href="/super-admin/gyms" className="text-xs text-violet-600 font-medium hover:text-violet-700">View all →</Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {pendingGyms.map((g) => (
              <div key={g.name} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--surface2)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">{g.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{g.name}</p>
                    <p className="text-xs text-[var(--muted)]">{g.owner} · {g.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${g.docs ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {g.docs ? "Docs OK" : "Docs Missing"}
                  </span>
                  <span className="text-xs text-[var(--muted2)]">{g.submitted}</span>
                  <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"><CheckCircle size={12} /> Approve</button>
                  <button className="px-3 py-1.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"><XCircle size={12} /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table + AI */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><TopGymsTable /></div>
          <AIAssistant />
        </div>

        {/* Plan dist + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <PlanDistribution />
          <div className="xl:col-span-2"><RecentActivity /></div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
