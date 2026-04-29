"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";
import AttendanceChart from "@/components/AttendanceChart";
import RetentionGauge from "@/components/RetentionGauge";
import { Users, CreditCard, CalendarCheck, TrendingUp, QrCode, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

const stats = [
  { title: "Active Members",  value: "2,310", change: 12.3, icon: Users,        iconBg: "bg-blue-50 dark:bg-blue-900/20",    iconColor: "text-blue-600" },
  { title: "Monthly Revenue", value: "₹1.24L",change: 8.1,  icon: CreditCard,   iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconColor: "text-emerald-600" },
  { title: "Classes Today",   value: "8",     change: 0,    icon: CalendarCheck,iconBg: "bg-amber-50 dark:bg-amber-900/20",  iconColor: "text-amber-600" },
  { title: "Check-ins Today", value: "142",   change: 5.2,  icon: TrendingUp,   iconBg: "bg-purple-50 dark:bg-purple-900/20",iconColor: "text-purple-600" },
];

const todayClasses = [
  { name: "Morning Yoga",      trainer: "Meera Nair",   time: "6:00 AM", capacity: "20/20", status: "Full" },
  { name: "HIIT Blast",        trainer: "Arjun Kapoor", time: "7:00 AM", capacity: "15/20", status: "Open" },
  { name: "Zumba Dance",       trainer: "Divya Patel",  time: "9:00 AM", capacity: "18/25", status: "Open" },
  { name: "Strength Training", trainer: "Rohit Sharma", time: "5:00 PM", capacity: "10/15", status: "Open" },
  { name: "Evening Yoga",      trainer: "Meera Nair",   time: "7:00 PM", capacity: "22/25", status: "Open" },
];

const recentCheckins = [
  { name: "Rahul Sharma", time: "6:02 AM", plan: "Yearly" },
  { name: "Priya Mehta",  time: "6:15 AM", plan: "Quarterly" },
  { name: "Sneha Patel",  time: "6:28 AM", plan: "Monthly" },
  { name: "Vikram Singh", time: "6:45 AM", plan: "Yearly" },
  { name: "Neha Joshi",   time: "7:01 AM", plan: "Monthly" },
];

export default function GymOwnerDashboard() {
  return (
    <RoleDashboardLayout
      title="Gym Dashboard"
      navItems={GYM_OWNER_NAV}
      role="gym-owner"
      userName="Suresh Nair"
      userEmail="suresh@ironparadise.in"
      userAvatar="SN"
    >
      <div className="space-y-5">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Welcome back, Suresh 👋</p>
              <h1 className="text-xl font-bold">Iron Paradise Fitness</h1>
              <p className="text-blue-200 text-sm mt-1">
                <strong className="text-white">142 check-ins</strong> today ·{" "}
                <strong className="text-white">8 classes</strong> scheduled ·{" "}
                <strong className="text-white">3 new members</strong> this week
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {[{ v: "4.9★", l: "Rating" }, { v: "92%", l: "Occupancy" }, { v: "8", l: "Pending Req." }].map((b) => (
                <div key={b.l} className="bg-white/10 rounded-xl p-3 text-center min-w-[72px]">
                  <p className="text-2xl font-black">{b.v}</p>
                  <p className="text-xs text-blue-200">{b.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Revenue + Attendance */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><RevenueChart /></div>
          <div className="flex flex-col gap-4">
            <AttendanceChart />
            <RetentionGauge />
          </div>
        </div>

        {/* Classes + Check-ins */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <CalendarCheck size={16} className="text-blue-600" />
                <p className="font-semibold text-[var(--text)]">Today's Classes</p>
              </div>
              <Link href="/gym-owner/classes" className="text-xs text-blue-600 font-medium hover:text-blue-700">Manage →</Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {todayClasses.map((c) => (
                <div key={c.name} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--surface2)] transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{c.name}</p>
                    <p className="text-xs text-[var(--muted)]">{c.trainer} · {c.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">{c.capacity}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === "Full" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <QrCode size={16} className="text-blue-600" />
                <p className="font-semibold text-[var(--text)]">Recent Check-ins</p>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live</span>
              </div>
              <Link href="/gym-owner/attendance" className="text-xs text-blue-600 font-medium hover:text-blue-700">View all →</Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {recentCheckins.map((c) => (
                <div key={c.name} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface2)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text)]">{c.name}</p>
                    <p className="text-xs text-[var(--muted)]">{c.plan}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><Clock size={11} /> {c.time}</div>
                  <CheckCircle size={15} className="text-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
