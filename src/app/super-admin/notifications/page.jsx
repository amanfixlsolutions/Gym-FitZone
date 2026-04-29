"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { Bell, Send, Users, Building2, CheckCircle, Trash2, AlertTriangle, CreditCard } from "lucide-react";

const notifs = [
  { title: "New gym registered",   desc: "FitLife Studio – Delhi submitted for approval",  time: "2 min ago",  type: "gym",     read: false },
  { title: "Payment received",     desc: "Rahul Sharma paid ₹2,999 for Quarterly plan",   time: "15 min ago", type: "payment", read: false },
  { title: "Gym approved",         desc: "CrossFit Arena – Kolkata is now live",           time: "1 hr ago",   type: "gym",     read: false },
  { title: "Review flagged",       desc: "Inappropriate content on Iron Paradise",         time: "2 hr ago",   type: "alert",   read: true },
  { title: "Payment failed",       desc: "Priya Mehta – ₹1,499 payment failed",           time: "3 hr ago",   type: "payment", read: true },
  { title: "Membership paused",    desc: "Amit Kumar paused membership for 30 days",       time: "5 hr ago",   type: "member",  read: true },
  { title: "New member joined",    desc: "Sneha Patel joined Zen Yoga & Wellness",         time: "6 hr ago",   type: "member",  read: true },
];

const typeConfig = {
  gym:     { icon: Building2,    bg: "bg-blue-100 dark:bg-blue-900/30",       color: "text-blue-600" },
  payment: { icon: CreditCard,   bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600" },
  alert:   { icon: AlertTriangle,bg: "bg-amber-100 dark:bg-amber-900/30",     color: "text-amber-600" },
  member:  { icon: Users,        bg: "bg-violet-100 dark:bg-violet-900/30",   color: "text-violet-600" },
};

export default function Page() {
  return (
    <RoleDashboardLayout title="Notifications" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Notifications</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform alerts and broadcast messages</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm transition-colors">
              <CheckCircle size={15} /> Mark all read
            </button>
            <button className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm">
              <Send size={15} /> Broadcast
            </button>
          </div>
        </div>

        {/* Broadcast panel */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5">
          <p className="font-semibold text-[var(--text)] mb-4">Send Platform Notification</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Target Audience</label>
              <select className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                <option>All Members</option>
                <option>Active Members</option>
                <option>Gym Owners</option>
                <option>Expiring Soon</option>
                <option>Inactive Members</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Channel</label>
              <select className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                <option>In-App</option>
                <option>Email</option>
                <option>SMS</option>
                <option>WhatsApp</option>
                <option>Push Notification</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Title</label>
              <input type="text" placeholder="Notification title..." className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Message</label>
            <textarea rows={2} placeholder="Write your message..." className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
          </div>
          <div className="flex justify-end mt-3">
            <button className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium">
              <Send size={14} /> Send Now
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Recent Activity</p>
            <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold px-2 py-0.5 rounded-full">3 unread</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {notifs.map((n, i) => {
              const tc = typeConfig[n.type];
              return (
                <div key={i} className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-[var(--surface2)] transition-colors ${!n.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                    <tc.icon size={16} className={tc.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm text-[var(--text)] ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{n.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-[var(--muted2)] whitespace-nowrap hidden sm:block">{n.time}</span>
                    <button className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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
