"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { CheckCircle, Trash2, Users, CreditCard, CalendarCheck, AlertTriangle } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";

const notifs = [
  { title: "New member joined",   desc: "Kavita Rao joined with Yearly plan",    time: "5 min ago",  type: "member",  read: false },
  { title: "Payment received",    desc: "Rahul Sharma – ₹2,999 Quarterly plan",  time: "20 min ago", type: "payment", read: false },
  { title: "Class fully booked",  desc: "Morning Yoga – Jan 29 is now full",     time: "1 hr ago",   type: "class",   read: false },
  { title: "Membership expiring", desc: "Vikram Singh's plan expires in 3 days", time: "2 hr ago",   type: "alert",   read: true },
  { title: "Payment failed",      desc: "Priya Mehta – ₹1,499 payment failed",   time: "3 hr ago",   type: "payment", read: true },
  { title: "New review received", desc: "Rahul Sharma gave 5★ rating",           time: "5 hr ago",   type: "member",  read: true },
];
const typeConfig = {
  member:  { icon: Users,         bg: "bg-blue-100 dark:bg-blue-900/30",       color: "text-blue-600" },
  payment: { icon: CreditCard,    bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600" },
  class:   { icon: CalendarCheck, bg: "bg-purple-100 dark:bg-purple-900/30",   color: "text-purple-600" },
  alert:   { icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-900/30",     color: "text-amber-600" },
};

export default function Page() {
  return (
    <RoleDashboardLayout title="Notifications" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Notifications</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Gym activity alerts and updates</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm w-fit">
            <CheckCircle size={15} /> Mark all read
          </button>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Recent Activity</p>
            <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold px-2 py-0.5 rounded-full">3 unread</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {notifs.map((n, i) => {
              const tc = typeConfig[n.type];
              return (
                <div key={i} className={`flex items-start gap-4 px-5 py-4 hover:bg-[var(--surface2)] transition-colors ${!n.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                    <tc.icon size={16} className={tc.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm text-[var(--text)] ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{n.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-[var(--muted2)] whitespace-nowrap">{n.time}</span>
                    <button className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 size={13} className="text-[var(--muted2)] hover:text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
