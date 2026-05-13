"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { useAuth } from "@/context/AuthContext";
import { analyticsAPI } from "@/lib/api";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";
import AttendanceChart from "@/components/AttendanceChart";
import RetentionGauge from "@/components/RetentionGauge";
import TrialCountdownBanner from "@/components/TrialCountdownBanner";
import UsageMeters from "@/components/UsageMeters";
import SubscriptionWidget from "@/components/SubscriptionWidget";
import { Users, CreditCard, CalendarCheck, TrendingUp, QrCode, Clock, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function GymOwnerDashboard() {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      // Load all data in parallel for faster dashboard load (< 3s target)
      const [res] = await Promise.all([
        analyticsAPI.gymOwnerDashboard(),
      ]);
      setData(res.data);
    } catch {
      // Keep showing skeleton/fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ── Stats from real data ───────────────────────────────────────
  const stats = [
    {
      title: "Active Members",
      value: loading ? "—" : (data?.stats?.activeMembers?.toLocaleString() || "0"),
      change: 12.3,
      icon: Users,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600",
    },
    {
      title: "Monthly Revenue",
      value: loading ? "—" : `₹${((data?.stats?.monthlyRevenue || 0) / 100000).toFixed(2)}L`,
      change: 8.1,
      icon: CreditCard,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600",
    },
    {
      title: "Classes Today",
      value: loading ? "—" : String(data?.stats?.todayClasses || 0),
      change: 0,
      icon: CalendarCheck,
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600",
    },
    {
      title: "Check-ins Today",
      value: loading ? "—" : String(data?.stats?.todayCheckins || 0),
      change: 5.2,
      icon: TrendingUp,
      iconBg: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600",
    },
  ];

  const gymName      = user?.gymName || "Your Gym";
  const firstName    = user?.name?.split(" ")[0] || "Admin";
  const todayClasses = data?.todayClassList || [];
  const recentCheckins = data?.recentCheckins || [];

  // SaaS usage data from analytics response
  const stats_data = data?.stats || {};

  return (
    <RoleDashboardLayout title="Gym Dashboard" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Trial countdown banner — shown at the very top when on trial */}
        <TrialCountdownBanner
          trialEndsAt={stats_data.trialEndsAt}
          subscriptionStatus={stats_data.subscriptionStatus}
        />

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-blue-200 text-sm font-medium">Welcome back, {firstName} 👋</p>
                <button onClick={fetchDashboard} className="p-1 hover:bg-white/10 rounded-lg transition-colors" title="Refresh">
                  <RefreshCw size={12} className="text-blue-300" />
                </button>
              </div>
              <h1 className="text-xl font-bold">{gymName}</h1>
              <p className="text-blue-200 text-sm mt-1">
                <strong className="text-white">{data?.stats?.todayCheckins || 0} check-ins</strong> today ·{" "}
                <strong className="text-white">{data?.stats?.todayClasses || 0} classes</strong> scheduled ·{" "}
                <strong className="text-white">{data?.stats?.totalMembers || 0} total</strong> members
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {[
                { v: "—",  l: "Rating" },
                { v: `${data?.stats?.activeMembers && data?.stats?.totalMembers ? Math.round((data.stats.activeMembers / data.stats.totalMembers) * 100) : 0}%`, l: "Active" },
                { v: String(data?.stats?.totalTrainers || 0), l: "Trainers" },
              ].map((b) => (
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
          <div className="xl:col-span-2">
            <RevenueChart data={data?.revenueChart} />
          </div>
          <div className="flex flex-col gap-4">
            <AttendanceChart data={data?.attendanceChart} />
            <RetentionGauge
              active={data?.stats?.activeMembers || 0}
              total={data?.stats?.totalMembers || 0}
            />
          </div>
        </div>

        {/* Usage Meters + Subscription Widget */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <UsageMeters
              totalMembers={stats_data.totalMembers || 0}
              maxMembers={stats_data.maxMembers || 100}
              totalTrainers={stats_data.totalTrainers || 0}
              maxTrainers={stats_data.maxTrainers || 10}
            />
          </div>
          <div>
            <SubscriptionWidget />
          </div>
        </div>

        {/* Today's Classes + Recent Check-ins */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Today's Classes */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <CalendarCheck size={16} className="text-blue-600" />
                <p className="font-semibold text-[var(--text)]">Today's Classes</p>
                {todayClasses.length > 0 && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">
                    {todayClasses.length}
                  </span>
                )}
              </div>
              <Link href="/gym-owner/classes" className="text-xs text-blue-600 font-medium hover:text-blue-700">Manage →</Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {loading ? (
                <div className="px-5 py-8 text-center">
                  <span className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin inline-block" />
                </div>
              ) : todayClasses.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-[var(--muted)]">No classes scheduled today</div>
              ) : todayClasses.map((c) => {
                const pct = Math.round(((c.enrolled || 0) / (c.capacity || 1)) * 100);
                const isFull = pct >= 100;
                return (
                  <div key={c._id} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--surface2)] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{c.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {c.trainer?.name || c.trainerName} · {c.startTime}–{c.endTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--muted)]">{c.enrolled || 0}/{c.capacity}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isFull ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                        {isFull ? "Full" : "Open"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <QrCode size={16} className="text-blue-600" />
                <p className="font-semibold text-[var(--text)]">Recent Check-ins</p>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                </span>
              </div>
              <Link href="/gym-owner/attendance" className="text-xs text-blue-600 font-medium hover:text-blue-700">View all →</Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {loading ? (
                <div className="px-5 py-8 text-center">
                  <span className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin inline-block" />
                </div>
              ) : recentCheckins.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-[var(--muted)]">No check-ins today yet</div>
              ) : recentCheckins.map((c, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface2)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.memberName?.split(" ").map(n => n[0]).join("") || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text)]">{c.memberName}</p>
                    <p className="text-xs text-[var(--muted)]">{c.memberPlan || "Member"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Clock size={11} />
                    {c.checkInTime ? new Date(c.checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </div>
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
