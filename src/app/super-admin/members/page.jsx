"use client";
import { useState } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { Search, Filter, Download, MoreVertical, Mail, Phone, UserPlus, X, Check, Eye, Ban } from "lucide-react";

const GYMS = ["Iron Paradise", "PowerHouse Gym", "FitLife Studio", "Zen Yoga", "CrossFit Arena", "Muscle Factory"];
const PLANS = ["Day Pass", "Weekly", "Monthly", "Quarterly", "Yearly", "Class Pass", "Family Plan"];

const INITIAL = [
  { id: "M1024", name: "Rahul Sharma",  email: "rahul@example.com",  phone: "+91 98765 43210", gym: "Iron Paradise",  plan: "Yearly",    status: "Active",  joined: "Jan 15, 2025" },
  { id: "M1023", name: "Priya Mehta",   email: "priya@example.com",  phone: "+91 98765 43211", gym: "PowerHouse Gym", plan: "Quarterly", status: "Active",  joined: "Jan 12, 2025" },
  { id: "M1022", name: "Amit Kumar",    email: "amit@example.com",   phone: "+91 98765 43212", gym: "FitLife Studio", plan: "Monthly",   status: "Paused",  joined: "Dec 28, 2024" },
  { id: "M1021", name: "Sneha Patel",   email: "sneha@example.com",  phone: "+91 98765 43213", gym: "Zen Yoga",       plan: "Day Pass",  status: "Active",  joined: "Jan 10, 2025" },
  { id: "M1020", name: "Vikram Singh",  email: "vikram@example.com", phone: "+91 98765 43214", gym: "CrossFit Arena", plan: "Yearly",    status: "Expired", joined: "Nov 5, 2024" },
  { id: "M1019", name: "Neha Joshi",    email: "neha@example.com",   phone: "+91 98765 43215", gym: "Iron Paradise",  plan: "Monthly",   status: "Active",  joined: "Jan 20, 2025" },
];

const statusCls = {
  Active:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Paused:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Banned:  "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

const EMPTY = { name: "", email: "", phone: "", gym: "", plan: "Monthly", age: "", gender: "", notes: "" };

export default function Page() {
  const [members, setMembers] = useState(INITIAL);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.phone.includes(q) || m.gym.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.gym) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setMembers(p => [{
      id: `M${1000 + p.length + 1}`,
      name: form.name, email: form.email, phone: form.phone,
      gym: form.gym, plan: form.plan, status: "Active",
      joined: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    }, ...p]);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY); }, 1200);
  };

  const toggleBan = (id) => setMembers(p => p.map(m => m.id === id ? { ...m, status: m.status === "Banned" ? "Active" : "Banned" } : m));
  const deleteMember = (id) => setMembers(p => p.filter(m => m.id !== id));

  return (
    <RoleDashboardLayout title="All Members" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">All Members</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Platform-wide member management — {members.length} total</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm">
              <Download size={14} /> Export
            </button>
            <button onClick={() => { setForm(EMPTY); setShowModal(true); }}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm shadow-sm">
              <UserPlus size={15} /> Add Member
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Members", value: members.length.toLocaleString() },
            { label: "Active",        value: members.filter(m => m.status === "Active").length.toLocaleString() },
            { label: "Paused",        value: members.filter(m => m.status === "Paused").length.toLocaleString() },
            { label: "Expired/Banned",value: members.filter(m => m.status === "Expired" || m.status === "Banned").length.toLocaleString() },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search by name, email, phone, gym..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Active", "Paused", "Expired"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === f ? "bg-violet-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["ID", "Name", "Contact", "Gym", "Plan", "Status", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-[var(--muted)]">No members found</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{m.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {m.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium text-[var(--text)] whitespace-nowrap">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><Mail size={11} />{m.email}</div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><Phone size={11} />{m.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text)] whitespace-nowrap">{m.gym}</td>
                    <td className="px-4 py-3"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 whitespace-nowrap">{m.plan}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[m.status]}`}>{m.status}</span></td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{m.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewMember(m)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="View"><Eye size={14} className="text-blue-600" /></button>
                        <button onClick={() => toggleBan(m.id)} className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg" title={m.status === "Banned" ? "Unban" : "Ban"}>
                          <Ban size={14} className={m.status === "Banned" ? "text-emerald-500" : "text-amber-500"} />
                        </button>
                        <button onClick={() => deleteMember(m.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                          <X size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ADD MEMBER MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">Add New Member</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Register a member on the platform</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[var(--surface2)] rounded-lg"><X size={18} className="text-[var(--muted)]" /></button>
            </div>
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4"><Check size={32} className="text-emerald-600" /></div>
                <p className="text-lg font-bold text-[var(--text)]">Member Added!</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name} has been registered successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input required type="text" placeholder="Rahul Sharma" value={form.name} onChange={e => set("name", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input required type="email" placeholder="rahul@example.com" value={form.email} onChange={e => set("email", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Phone <span className="text-red-500">*</span></label>
                    <input required type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Age</label>
                    <input type="number" placeholder="25" min="10" max="100" value={form.age} onChange={e => set("age", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Gender</label>
                    <select value={form.gender} onChange={e => set("gender", e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                      <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Assign Gym <span className="text-red-500">*</span></label>
                  <select required value={form.gym} onChange={e => set("gym", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                    <option value="">Select gym</option>
                    {GYMS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Select Plan <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PLANS.map(p => (
                      <button key={p} type="button" onClick={() => set("plan", p)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.plan === p ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400" : "border-[var(--border)] text-[var(--muted)] hover:border-violet-300"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Notes</label>
                  <textarea rows={2} placeholder="Health conditions, special notes..." value={form.notes} onChange={e => set("notes", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={15} />}
                    {saving ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── VIEW MEMBER MODAL ── */}
      {viewMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--text)]">Member Details</h2>
              <button onClick={() => setViewMember(null)} className="p-2 hover:bg-[var(--surface2)] rounded-lg"><X size={18} className="text-[var(--muted)]" /></button>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {viewMember.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--text)]">{viewMember.name}</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls[viewMember.status]}`}>{viewMember.status}</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Member ID", value: viewMember.id },
                  { label: "Email",     value: viewMember.email },
                  { label: "Phone",     value: viewMember.phone },
                  { label: "Gym",       value: viewMember.gym },
                  { label: "Plan",      value: viewMember.plan },
                  { label: "Joined",    value: viewMember.joined },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <span className="text-xs font-medium text-[var(--muted)]">{f.label}</span>
                    <span className="text-sm font-medium text-[var(--text)]">{f.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { toggleBan(viewMember.id); setViewMember(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${viewMember.status === "Banned" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                  {viewMember.status === "Banned" ? "Unban Member" : "Ban Member"}
                </button>
                <button onClick={() => { deleteMember(viewMember.id); setViewMember(null); }}
                  className="flex-1 py-2.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors">
                  Delete Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}
