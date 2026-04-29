"use client";
import { useState } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { UserPlus, Search, Filter, Download, MoreVertical, Mail, Phone, QrCode, X, Check } from "lucide-react";

const INITIAL_MEMBERS = [
  { id: "M1024", name: "Rahul Sharma",  email: "rahul@example.com",  phone: "+91 98765 43210", plan: "Yearly",    status: "Active",  expiry: "Jan 15, 2026", checkins: 142 },
  { id: "M1023", name: "Priya Mehta",   email: "priya@example.com",  phone: "+91 98765 43211", plan: "Quarterly", status: "Active",  expiry: "Apr 12, 2025", checkins: 89 },
  { id: "M1022", name: "Amit Kumar",    email: "amit@example.com",   phone: "+91 98765 43212", plan: "Monthly",   status: "Paused",  expiry: "Feb 28, 2025", checkins: 34 },
  { id: "M1021", name: "Sneha Patel",   email: "sneha@example.com",  phone: "+91 98765 43213", plan: "Day Pass",  status: "Active",  expiry: "Jan 28, 2025", checkins: 1 },
  { id: "M1020", name: "Vikram Singh",  email: "vikram@example.com", phone: "+91 98765 43214", plan: "Yearly",    status: "Expired", expiry: "Nov 5, 2024",  checkins: 210 },
  { id: "M1019", name: "Neha Joshi",    email: "neha@example.com",   phone: "+91 98765 43215", plan: "Monthly",   status: "Active",  expiry: "Feb 20, 2025", checkins: 28 },
  { id: "M1018", name: "Deepak Verma",  email: "deepak@example.com", phone: "+91 98765 43216", plan: "Quarterly", status: "Active",  expiry: "Mar 10, 2025", checkins: 67 },
  { id: "M1017", name: "Kavita Rao",    email: "kavita@example.com", phone: "+91 98765 43217", plan: "Yearly",    status: "Active",  expiry: "Dec 1, 2025",  checkins: 198 },
];

const statusCls = {
  Active:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Paused:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const PLANS = ["Day Pass", "Weekly", "Monthly", "Quarterly", "Yearly", "Class Pass"];
const EMPTY_FORM = { name: "", email: "", phone: "", plan: "Monthly", gender: "", age: "", address: "", emergencyContact: "", notes: "" };

export default function Page() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);
    const matchStatus = filterStatus === "All" || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const newMember = {
      id: `M${1000 + members.length + 1}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      plan: form.plan,
      status: "Active",
      expiry: "—",
      checkins: 0,
    };
    setMembers(p => [newMember, ...p]);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); }, 1200);
  };

  return (
    <RoleDashboardLayout title="My Members" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">My Members</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Iron Paradise Fitness — {members.length} total members</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-fit shadow-sm"
          >
            <UserPlus size={15} /> Add Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total",         value: members.length },
            { label: "Active",        value: members.filter(m => m.status === "Active").length },
            { label: "Expiring Soon", value: 84 },
            { label: "Paused",        value: members.filter(m => m.status === "Paused").length },
          ].map((s) => (
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
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Active", "Paused", "Expired"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === f ? "bg-blue-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"}`}>
                {f}
              </button>
            ))}
            <button className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["ID", "Name", "Contact", "Plan", "Status", "Expiry", "Check-ins", ""].map(h => (
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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
                    <td className="px-4 py-3"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">{m.plan}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[m.status]}`}>{m.status}</span></td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{m.expiry}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">{m.checkins}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="QR Code"><QrCode size={14} className="text-blue-600" /></button>
                        <button className="p-1.5 hover:bg-[var(--surface2)] rounded-lg"><MoreVertical size={14} className="text-[var(--muted)]" /></button>
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
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">Add New Member</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Fill in the details to register a new member</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="p-2 hover:bg-[var(--surface2)] rounded-lg transition-colors">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-[var(--text)]">Member Added!</p>
                <p className="text-sm text-[var(--muted)] mt-1">{form.name || "New member"} has been registered successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
                {/* Personal info */}
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Personal Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input required type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => set("name", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Email <span className="text-red-500">*</span></label>
                      <input required type="email" placeholder="rahul@example.com" value={form.email} onChange={e => set("email", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Phone <span className="text-red-500">*</span></label>
                      <input required type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Age</label>
                      <input type="number" placeholder="25" min="10" max="100" value={form.age} onChange={e => set("age", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Gender</label>
                      <select value={form.gender} onChange={e => set("gender", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="">Select gender</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Membership */}
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Membership</p>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-2">Select Plan <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PLANS.map(p => (
                        <button key={p} type="button" onClick={() => set("plan", p)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.plan === p ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-[var(--border)] text-[var(--muted)] hover:border-blue-300"}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional */}
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Additional Info</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Address</label>
                      <input type="text" placeholder="Full address" value={form.address} onChange={e => set("address", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Emergency Contact</label>
                      <input type="tel" placeholder="+91 98765 43210" value={form.emergencyContact} onChange={e => set("emergencyContact", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Notes (health conditions, injuries)</label>
                      <textarea rows={2} placeholder="Any health conditions or special notes..." value={form.notes} onChange={e => set("notes", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={15} />}
                    {saving ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}
