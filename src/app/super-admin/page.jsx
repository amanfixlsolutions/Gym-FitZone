"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { useAuth } from "@/context/AuthContext";
import { analyticsAPI, gymAPI, paymentAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";
import AttendanceChart from "@/components/AttendanceChart";
import RetentionGauge from "@/components/RetentionGauge";
import TopGymsTable from "@/components/TopGymsTable";
import RecentActivity from "@/components/RecentActivity";
import PlanDistribution from "@/components/PlanDistribution";
import {
  Users, Building2, CreditCard, Percent,
  AlertTriangle, CheckCircle, XCircle, RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, revenueRes] = await Promise.all([
        analyticsAPI.superAdminDashboard(),
        paymentAPI.revenue(),
      ]);
      setData(analyticsRes.data);
      setRevenue(revenueRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ── Approve gym ────────────────────────────────────────────────
  const handleApprove = async (gymId, gymName) => {
    setApproving(gymId);
    try {
      await gymAPI.approve(gymId);
      showSuccess(`${gymName} approved!`);
      fetchDashboard();
    } catch (err) {
      showError(err.message || "Failed to approve gym");
    } finally {
      setApproving(null);
    }
  };

  // ── Reject gym ─────────────────────────────────────────────────
  const handleReject = async (gymId, gymName) => {
    setApproving(gymId + "_reject");
    try {
      await gymAPI.reject(gymId, "Does not meet platform requirements");
      showError(`${gymName} rejected.`);
      fetchDashboard();
    } catch (err) {
      showError(err.message || "Failed to reject gym");
    } finally {
      setApproving(null);
    }
  };

  const stats = data?.stats || {};
  const firstName = user?.name?.split(" ")[0] || "Admin";

  const statCards = [
    {
      title: "Total Members",
      value: loading ? "—" : (stats.totalMembers || 0).toLocaleString(),
      change: 15.5,
      icon: Users,
      iconBg: "bg-violet-50 dark:bg-violet-900/20",
      iconColor: "text-violet-600",
    },
    {
      title: "Active Gyms",
      value: loading ? "—" : (stats.activeGyms || 0).toLocaleString(),
      change: 8.4,
      icon: Building2,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600",
    },
    {
      title: "Platform GMV",
      value: loading ? "—" : stats.platformGMV >= 10000000
        ? `₹${(stats.platformGMV / 10000000).toFixed(2)}Cr`
        : stats.platformGMV >= 100000
        ? `₹${(stats.platformGMV / 100000).toFixed(2)}L`
        : `₹${(stats.platformGMV || 0).toLocaleString()}`,
      change: 18.4,
      icon: CreditCard,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600",
    },
    {
      title: "Commission Earned",
      value: loading ? "—" : stats.commissionEarned >= 100000
        ? `₹${(stats.commissionEarned / 100000).toFixed(1)}L`
        : `₹${(stats.commissionEarned || 0).toLocaleString()}`,
      change: 18.4,
      icon: Percent,
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600",
    },
  ];

  const pendingGymsList = data?.pendingGymsList || [];

  return (
    <RoleDashboardLayout title="Super Admin Dashboard" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-violet-200 text-sm font-medium">Welcome back, {firstName} 👋</p>
                <button onClick={fetchDashboard} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer" title="Refresh">
                  <RefreshCw size={12} className={`text-violet-300 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
              <h1 className="text-2xl font-bold">Platform Overview</h1>
              <p className="text-violet-200 text-sm mt-1">
                <strong className="text-white">{stats.pendingGyms || 0} gyms</strong> pending approval ·{" "}
                <strong className="text-white">{stats.totalTrainers || 0} trainers</strong> registered ·{" "}
                <strong className="text-white">10%</strong> commission rate
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {[
                { v: String(stats.pendingGyms || 0), l: "Pending Gyms" },
                { v: String(stats.totalTrainers || 0), l: "Trainers" },
                { v: "10%", l: "Commission" },
              ].map(b => (
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
          {statCards.map(s => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Revenue + Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <RevenueChart
              data={revenue?.chart}
              totalRevenue={revenue?.total}
              activeMembers={stats.activeMembers}
              newJoins={stats.totalMembers}
            />
          </div>
          <div className="flex flex-col gap-4">
            <AttendanceChart data={data?.attendanceChart} />
            <RetentionGauge
              active={stats.activeMembers || 0}
              total={stats.totalMembers || 0}
            />
          </div>
        </div>

        {/* Pending Gym Approvals */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <p className="font-semibold text-[var(--text)]">Pending Gym Approvals</p>
              {stats.pendingGyms > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
                  {stats.pendingGyms} waiting
                </span>
              )}
            </div>
            <Link href="/super-admin/gyms" className="text-xs text-violet-600 font-medium hover:text-violet-700 cursor-pointer">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-center">
              <span className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin inline-block" />
            </div>
          ) : pendingGymsList.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-[var(--muted)]">
              <CheckCircle size={24} className="mx-auto mb-2 text-emerald-500 opacity-60" />
              No pending approvals — all gyms are reviewed!
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {pendingGymsList.map(g => (
                <div key={g._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--surface2)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(g.name || "G")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{g.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {g.owner?.name || g.ownerName} · {g.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${g.docs?.submitted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {g.docs?.submitted ? "Docs OK" : "Docs Missing"}
                    </span>
                    <span className="text-xs text-[var(--muted2)]">
                      {g.createdAt ? new Date(g.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                    </span>
                    <button
                      onClick={() => handleApprove(g._id, g.name)}
                      disabled={approving === g._id}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {approving === g._id
                        ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        : <CheckCircle size={12} />
                      }
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(g._id, g.name)}
                      disabled={approving === g._id + "_reject"}
                      className="px-3 py-1.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-200 disabled:opacity-60 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {approving === g._id + "_reject"
                        ? <span className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        : <XCircle size={12} />
                      }
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Gyms + Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <TopGymsTable data={data?.topGyms} />
          </div>
          <RecentActivity data={data?.recentActivity} />
        </div>

        {/* Plan Distribution + Revenue Summary */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <PlanDistribution data={data?.planDistribution} />
          <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Revenue",   value: revenue?.total   || 0 },
              { label: "Monthly Revenue", value: revenue?.monthly || 0 },
              { label: "Yearly Revenue",  value: revenue?.yearly  || 0 },
            ].map(s => (
              <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <p className="text-xs text-[var(--muted)] mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--text)]">
                  {s.value >= 10000000
                    ? `₹${(s.value / 10000000).toFixed(2)}Cr`
                    : s.value >= 100000
                    ? `₹${(s.value / 100000).toFixed(2)}L`
                    : `₹${s.value.toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </RoleDashboardLayout>
  );
}
