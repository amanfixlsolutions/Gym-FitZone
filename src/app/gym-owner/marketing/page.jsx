"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { Megaphone, Send, Users, Tag, Plus, TrendingUp } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";

const campaigns = [
  { name: "New Year Offer",    target: "All Members",    channel: "WhatsApp + Email", sent: 2310, opened: 1842, status: "Sent",  date: "Jan 1, 2025" },
  { name: "Renewal Reminder",  target: "Expiring Soon",  channel: "SMS + Email",      sent: 84,   opened: 71,   status: "Sent",  date: "Jan 20, 2025" },
  { name: "Zumba Launch",      target: "Female Members", channel: "In-App",           sent: 0,    opened: 0,    status: "Draft", date: "—" },
  { name: "Referral Campaign", target: "Active Members", channel: "WhatsApp",         sent: 1200, opened: 890,  status: "Sent",  date: "Jan 15, 2025" },
];
const statusCls = { Sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", Draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };

export default function Page() {
  return (
    <RoleDashboardLayout title="Marketing" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Marketing</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Campaigns, offers and lead management</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-fit"><Plus size={15} /> New Campaign</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: "Campaigns Sent", value: "12", icon: Megaphone }, { label: "Total Reach", value: "3,594", icon: Users }, { label: "Avg Open Rate", value: "78%", icon: TrendingUp }, { label: "Active Promos", value: "3", icon: Tag }].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3"><s.icon size={16} className="text-blue-600" /></div>
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <p className="font-semibold text-[var(--text)] mb-4">Quick Broadcast</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Target Audience</label>
              <select className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>All Members</option><option>Active Members</option><option>Expiring Soon</option><option>Inactive Members</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Channel</label>
              <select className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>WhatsApp</option><option>SMS</option><option>Email</option><option>In-App</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Title</label>
              <input type="text" placeholder="Campaign title..." className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Message</label>
            <textarea rows={2} placeholder="Write your message..." className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
          </div>
          <div className="flex justify-end mt-3">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"><Send size={14} /> Send Now</button>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]"><p className="font-semibold text-[var(--text)]">Past Campaigns</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[550px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["Campaign", "Target", "Channel", "Sent", "Opened", "Date", "Status"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {campaigns.map((c) => (
                  <tr key={c.name} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{c.target}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{c.channel}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">{c.sent > 0 ? c.sent.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">{c.opened > 0 ? `${c.opened} (${Math.round((c.opened/c.sent)*100)}%)` : "—"}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{c.date}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls[c.status]}`}>{c.status}</span></td>
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
