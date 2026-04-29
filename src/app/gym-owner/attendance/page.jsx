"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import AttendanceChart from "@/components/AttendanceChart";
import { QrCode, CheckCircle, Clock, TrendingUp, Users } from "lucide-react";

const checkins = [
  { name: "Rahul Sharma",  time: "6:02 AM", plan: "Yearly",    type: "Gym Access",  status: "In" },
  { name: "Priya Mehta",   time: "6:15 AM", plan: "Quarterly", type: "Yoga Class",  status: "In" },
  { name: "Sneha Patel",   time: "6:28 AM", plan: "Monthly",   type: "Gym Access",  status: "In" },
  { name: "Vikram Singh",  time: "6:45 AM", plan: "Yearly",    type: "HIIT Blast",  status: "In" },
  { name: "Neha Joshi",    time: "7:01 AM", plan: "Monthly",   type: "Gym Access",  status: "In" },
  { name: "Amit Kumar",    time: "7:15 AM", plan: "Monthly",   type: "Gym Access",  status: "Out" },
  { name: "Deepak Verma",  time: "7:30 AM", plan: "Quarterly", type: "Zumba Class", status: "In" },
];

export default function Page() {
  return (
    <RoleDashboardLayout title="Attendance" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">QR Attendance</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Real-time member check-in/out tracking</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Check-ins Today", value: "142", icon: CheckCircle, color: "emerald" },
            { label: "Currently Inside", value: "38",  icon: Users,       color: "blue" },
            { label: "Peak Hour",        value: "7 AM", icon: TrendingUp,  color: "amber" },
            { label: "Avg Daily",        value: "128",  icon: Clock,       color: "purple" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg bg-${s.color}-100 dark:bg-${s.color}-900/20 flex items-center justify-center mb-3`}>
                <s.icon size={16} className={`text-${s.color}-600`} />
              </div>
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><AttendanceChart /></div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
              <QrCode size={36} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-[var(--text)] mb-2">QR Scanner</h3>
            <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed">Members show their QR code at the entrance to check in/out instantly.</p>
            <button className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">Open Scanner</button>
            <button className="w-full mt-2 border border-[var(--border)] text-[var(--text)] py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--surface2)] transition-colors">Manual Entry</button>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Today's Check-in Log</p>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["Member", "Time", "Plan", "Activity", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {checkins.map((c, i) => (
                  <tr key={i} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium text-[var(--text)] whitespace-nowrap">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{c.time}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-medium">{c.plan}</span></td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{c.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${c.status === "In" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {c.status === "In" ? "✓ Checked In" : "Checked Out"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
