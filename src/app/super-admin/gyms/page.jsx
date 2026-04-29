"use client";
import { useState } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import {
  Search, CheckCircle, XCircle, Eye, MapPin, Star,
  Plus, X, Check, Users, CreditCard, Building2,
  FileText, Phone, Mail, AlertTriangle, Filter,
} from "lucide-react";

const gyms = [
  { id: "#G1009", name: "Iron Paradise Fitness", owner: "Rajesh Gupta",  city: "Andheri, Mumbai",        members: 2310, revenue: "₹1,24,839", rating: 5.0, status: "Active",    submitted: "Jan 10, 2025", docs: true },
  { id: "#G1001", name: "PowerHouse Gym",         owner: "Suresh Nair",   city: "Koramangala, Bangalore", members: 1230, revenue: "₹92,662",   rating: 4.8, status: "Active",    submitted: "Jan 8, 2025",  docs: true },
  { id: "#G1010", name: "Muscle Factory",          owner: "Deepak Joshi",  city: "Wakad, Pune",            members: 0,    revenue: "—",         rating: 0,   status: "Pending",   submitted: "Jan 27, 2025", docs: true },
  { id: "#G1011", name: "Alpha Fitness",           owner: "Pradeep Rao",   city: "Anna Nagar, Chennai",    members: 0,    revenue: "—",         rating: 0,   status: "Pending",   submitted: "Jan 26, 2025", docs: false },
  { id: "#G1012", name: "Flex Zone",               owner: "Anita Gupta",   city: "Malviya Nagar, Jaipur",  members: 0,    revenue: "—",         rating: 0,   status: "Pending",   submitted: "Jan 25, 2025", docs: true },
  { id: "#G1002", name: "Zen Yoga & Wellness",     owner: "Kavita Rao",    city: "Banjara Hills, Hyderabad",members: 645, revenue: "₹62,820",   rating: 4.5, status: "Active",    submitted: "Dec 20, 2024", docs: true },
  { id: "#G1005", name: "Muscle Factory Old",      owner: "Deepak Joshi",  city: "Wakad, Pune",            members: 430,  revenue: "₹38,200",   rating: 4.2, status: "Suspended", submitted: "Nov 5, 2024",  docs: true },
];
const statusConfig = {
  Active:    { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  Pending:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  Suspended: { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function Page() {
  return (
    <RoleDashboardLayout title="Gym Approvals" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Gym Management</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Review, approve or suspend gyms on the platform</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ label: "Total Gyms", value: "6,225" }, { label: "Active", value: "5,890" }, { label: "Pending Approval", value: "12" }, { label: "Suspended", value: "51" }].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search gyms..." className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          {["All", "Pending", "Active", "Suspended"].map((f) => (
            <button key={f} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${f === "All" ? "bg-violet-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"}`}>{f}</button>
          ))}
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["ID", "Gym Name", "Owner", "Location", "Members", "Revenue", "Rating", "Docs", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {gyms.map((g) => (
                  <tr key={g.id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{g.id}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{g.name}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{g.owner}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-[var(--muted)] whitespace-nowrap"><MapPin size={11} />{g.city}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text)]">{g.members > 0 ? g.members.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 whitespace-nowrap">{g.revenue}</td>
                    <td className="px-4 py-3">
                      {g.rating > 0 ? <div className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-[var(--text)]">{g.rating}</span></div> : <span className="text-[var(--muted2)]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${g.docs ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {g.docs ? "Complete" : "Missing"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusConfig[g.status].cls}`}>{g.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-[var(--surface2)] rounded-lg" title="View"><Eye size={14} className="text-[var(--muted)]" /></button>
                        {g.status === "Pending" && <>
                          <button className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="Approve"><CheckCircle size={14} className="text-emerald-500" /></button>
                          <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Reject"><XCircle size={14} className="text-red-500" /></button>
                        </>}
                        {g.status === "Active" && <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Suspend"><XCircle size={14} className="text-red-500" /></button>}
                      </div>
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
