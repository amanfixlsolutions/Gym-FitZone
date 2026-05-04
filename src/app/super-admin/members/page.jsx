"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { memberAPI, gymAPI, planAPI } from "@/lib/api";
import { showSuccess, showError, confirmToast } from "@/lib/toast";
import {
  Search, Download, UserPlus, X, Check, Eye, Ban,
  Mail, Phone, RefreshCw, ChevronDown, Calendar,
  MapPin, CreditCard, Shield, Trash2, Users,
} from "lucide-react";

// ── Backend base for resolving relative photo URLs ─────────────────
const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "https://fitzone-backend-vis3.onrender.com/api").replace(/\/api$/, "");
const resolvePhoto = (p) => {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${BACKEND}${p.startsWith("/") ? "" : "/"}${p}`;
};

const statusCls = {
  Active:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Paused:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Banned:  "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const initials = (name) => name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

const EMPTY_FORM = {
  name: "", email: "", phone: "", gym: "", plan: "",
  age: "", gender: "", address: "", emergencyContact: "", notes: "",
};

// ── Member Detail Modal ────────────────────────────────────────────
function MemberDetailModal({ member, onClose, onBan, onUnban, onDelete }) {
  if (!member) return null;
  const isBanned = member.status === "Banned";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text)]">Member Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
            <X size={18} className="text-[var(--muted)]" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden relative">
              {member.photo
                ? <img src={resolvePhoto(member.photo)} alt={member.name} className="absolute inset-0 w-full h-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />
                : null}
              <span className={member.photo ? "opacity-0" : ""}>{initials(member.name)}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text)]">{member.name}</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls[member.status] || statusCls.Expired}`}>
                {member.status}
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-2.5">
            {[
              { label: "Member ID",  value: member._id?.slice(-8).toUpperCase() },
              { label: "Email",      value: member.email },
              { label: "Phone",      value: member.phone },
              { label: "Gym",        value: member.gym?.name || "—" },
              { label: "Plan",       value: member.planName || "—" },
              { label: "Expiry",     value: fmtDate(member.expiryDate) },
              { label: "Joined",     value: fmtDate(member.joinDate || member.createdAt) },
              { label: "Check-ins",  value: member.totalCheckins || 0 },
              { label: "Last Visit", value: fmtDate(member.lastCheckin) },
              ...(member.age    ? [{ label: "Age",     value: member.age }]    : []),
              ...(member.gender ? [{ label: "Gender",  value: member.gender }] : []),
              ...(member.address ? [{ label: "Address", value: member.address }] : []),
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-xs font-medium text-[var(--muted)]">{f.label}</span>
                <span className="text-sm font-medium text-[var(--text)] text-right max-w-[60%] truncate">{f.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { isBanned ? onUnban(member) : onBan(member); onClose(); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                isBanned
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
              }`}>
              {isBanned ? "Unban Member" : "Ban Member"}
            </button>
            <button
              onClick={() => { onDelete(member); onClose(); }}
              className="flex-1 py-2.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors cursor-pointer">
              Delete Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Member Modal ───────────────────────────────────────────────
function AddMemberModal({ gyms, plans, onClose, onSaved }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.gym) return;
    setSaving(true);
    try {
      await memberAPI.create({
        ...form,
        age: form.age ? parseInt(form.age) : undefined,
      });
      showSuccess(`${form.name} added successfully!`);
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 1000);
    } catch (err) {
      showError(err.message || "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Add New Member</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Register a member on the platform</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
            <X size={18} className="text-[var(--muted)]" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-[var(--text)]">Member Added!</p>
            <p className="text-sm text-[var(--muted)] mt-1">{form.name} has been registered successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Name */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="Rahul Sharma" value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Email <span className="text-red-500">*</span></label>
                <input required type="email" placeholder="rahul@example.com" value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Phone <span className="text-red-500">*</span></label>
                <input required type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
              </div>

              {/* Age */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Age</label>
                <input type="number" placeholder="25" min="10" max="100" value={form.age} onChange={e => set("age", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Gender</label>
                <div className="relative">
                  <select value={form.gender} onChange={e => set("gender", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>

              {/* Gym */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Assign Gym <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select required value={form.gym} onChange={e => set("gym", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none">
                    <option value="">Select gym</option>
                    {gyms.map(g => <option key={g._id} value={g._id}>{g.name}{g.city ? ` — ${g.city}` : ""}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted2)] pointer-events-none" />
                </div>
              </div>

              {/* Plan */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--muted)] block mb-2">Select Plan</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {plans.map(p => (
                    <button key={p._id} type="button" onClick={() => set("plan", p._id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all cursor-pointer text-left ${
                        form.plan === p._id
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-violet-300"
                      }`}>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-[10px] opacity-70">₹{p.price?.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Address</label>
                <input type="text" placeholder="123 Main St, City" value={form.address} onChange={e => set("address", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>

              {/* Emergency Contact */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Emergency Contact</label>
                <input type="text" placeholder="+91 98765 00000" value={form.emergencyContact} onChange={e => set("emergencyContact", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Notes</label>
                <textarea rows={2} placeholder="Health conditions, special notes..." value={form.notes} onChange={e => set("notes", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <UserPlus size={15} />}
                {saving ? "Adding..." : "Add Member"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function Page() {
  const [members,      setMembers]      = useState([]);
  const [gyms,         setGyms]         = useState([]);
  const [plans,        setPlans]        = useState([]);
  const [stats,        setStats]        = useState({ total: 0, active: 0, paused: 0, expired: 0 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);

  // Modals
  const [showAdd,     setShowAdd]     = useState(false);
  const [viewMember,  setViewMember]  = useState(null);

  const LIMIT = 20;

  // ── Fetch members ──────────────────────────────────────────────
  const fetchMembers = useCallback(async (pg = 1, statusFilter = filterStatus, q = search) => {
    try {
      setLoading(true);
      const params = { limit: LIMIT, page: pg };
      if (statusFilter !== "All") params.status = statusFilter;
      if (q.trim()) params.search = q.trim();

      const res = await memberAPI.getAll(params);
      setMembers(res.data || []);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.pages || 1);
      setPage(pg);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  // ── Fetch stats + gyms + plans ─────────────────────────────────
  const fetchMeta = useCallback(async () => {
    try {
      const [statsRes, gymsRes, plansRes] = await Promise.all([
        memberAPI.stats(),
        gymAPI.getAll({ status: "active", limit: 100 }),
        planAPI.getAll({ limit: 100 }),
      ]);
      setStats(statsRes.data || {});
      setGyms(gymsRes.data || []);
      setPlans(plansRes.data || []);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchMeta();
    fetchMembers(1, "All", "");
  }, [fetchMeta]);

  // ── Search with debounce ───────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => fetchMembers(1, filterStatus, search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Status filter change ───────────────────────────────────────
  const handleFilterChange = (s) => {
    setFilterStatus(s);
    fetchMembers(1, s, search);
  };

  // ── Ban member ─────────────────────────────────────────────────
  const handleBan = async (member) => {
    const confirmed = await confirmToast(`Ban ${member.name}? They will lose gym access.`);
    if (!confirmed) return;
    try {
      await memberAPI.ban(member._id);
      showSuccess(`${member.name} banned`);
      fetchMembers(page, filterStatus, search);
      fetchMeta();
    } catch (err) {
      showError(err.message || "Ban failed");
    }
  };

  // ── Unban member ───────────────────────────────────────────────
  const handleUnban = async (member) => {
    try {
      await memberAPI.unban(member._id);
      showSuccess(`${member.name} unbanned`);
      fetchMembers(page, filterStatus, search);
      fetchMeta();
    } catch (err) {
      showError(err.message || "Unban failed");
    }
  };

  // ── Delete member ──────────────────────────────────────────────
  const handleDelete = async (member) => {
    const confirmed = await confirmToast(`Delete ${member.name}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await memberAPI.delete(member._id);
      showSuccess("Member deleted");
      fetchMembers(page, filterStatus, search);
      fetchMeta();
    } catch (err) {
      showError(err.message || "Delete failed");
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────
  const handleExport = () => {
    if (!members.length) return;
    const headers = ["Name", "Email", "Phone", "Gym", "Plan", "Status", "Joined"];
    const rows = members.map(m => [
      m.name, m.email, m.phone,
      m.gym?.name || "",
      m.planName || "",
      m.status,
      fmtDate(m.joinDate || m.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "members.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RoleDashboardLayout title="All Members" navItems={SUPER_ADMIN_NAV} role="super-admin">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">All Members</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Platform-wide member management — {totalCount.toLocaleString()} total
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] text-[var(--text)] text-sm cursor-pointer">
              <Download size={14} /> Export
            </button>
            <button onClick={() => fetchMembers(page, filterStatus, search)}
              className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm shadow-sm cursor-pointer">
              <UserPlus size={15} /> Add Member
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Members",  value: stats.total   || 0, icon: Users },
            { label: "Active",         value: stats.active  || 0, icon: Shield },
            { label: "Paused",         value: stats.paused  || 0, icon: Calendar },
            { label: "Expired/Banned", value: (stats.expired || 0) + (stats.banned || 0), icon: Ban },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value.toLocaleString()}</p>
                <s.icon size={18} className="text-[var(--muted2)]" />
              </div>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input type="text" placeholder="Search by name, email, phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Active", "Paused", "Expired", "Banned"].map(f => (
              <button key={f} onClick={() => handleFilterChange(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === f
                    ? "bg-violet-600 text-white"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"
                }`}>
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
                <tr>
                  {["ID", "Name", "Contact", "Gym", "Plan", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-16" /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--surface2)]" />
                          <div className="h-3 bg-[var(--surface2)] rounded w-28" />
                        </div>
                      </td>
                      <td className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-36" /></td>
                      <td className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-24" /></td>
                      <td className="px-4 py-3"><div className="h-5 bg-[var(--surface2)] rounded-full w-16" /></td>
                      <td className="px-4 py-3"><div className="h-5 bg-[var(--surface2)] rounded-full w-14" /></td>
                      <td className="px-4 py-3"><div className="h-3 bg-[var(--surface2)] rounded w-20" /></td>
                      <td className="px-4 py-3"><div className="h-6 bg-[var(--surface2)] rounded w-20" /></td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <Users size={36} className="text-[var(--muted2)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--muted)]">No members found</p>
                    </td>
                  </tr>
                ) : members.map(m => (
                  <tr key={m._id} className="hover:bg-[var(--surface2)] transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {m._id?.slice(-6).toUpperCase()}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden relative">
                          {m.photo
                            ? <img src={resolvePhoto(m.photo)} alt={m.name} className="absolute inset-0 w-full h-full object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />
                            : null}
                          <span className={m.photo ? "opacity-0" : ""}>{initials(m.name)}</span>
                        </div>
                        <span className="font-medium text-[var(--text)] whitespace-nowrap">{m.name}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <Mail size={11} className="flex-shrink-0" />
                          <span className="truncate max-w-[160px]">{m.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <Phone size={11} className="flex-shrink-0" />{m.phone}
                        </div>
                      </div>
                    </td>

                    {/* Gym */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[var(--text)] whitespace-nowrap">
                        <MapPin size={11} className="text-[var(--muted2)] flex-shrink-0" />
                        {m.gym?.name || "—"}
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 whitespace-nowrap">
                        {m.planName || "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[m.status] || statusCls.Expired}`}>
                        {m.status}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                      {fmtDate(m.joinDate || m.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewMember(m)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer" title="View">
                          <Eye size={14} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => m.status === "Banned" ? handleUnban(m) : handleBan(m)}
                          className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg cursor-pointer"
                          title={m.status === "Banned" ? "Unban" : "Ban"}>
                          <Ban size={14} className={m.status === "Banned" ? "text-emerald-500" : "text-amber-500"} />
                        </button>
                        <button onClick={() => handleDelete(m)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer" title="Delete">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">
                Page {page} of {totalPages} · {totalCount.toLocaleString()} members
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchMembers(page - 1, filterStatus, search)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] transition-colors cursor-pointer">
                  ← Prev
                </button>
                <button
                  onClick={() => fetchMembers(page + 1, filterStatus, search)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium bg-[var(--surface2)] border border-[var(--border)] rounded-lg disabled:opacity-40 hover:bg-[var(--border)] transition-colors cursor-pointer">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Member Detail Modal ── */}
      {viewMember && (
        <MemberDetailModal
          member={viewMember}
          onClose={() => setViewMember(null)}
          onBan={handleBan}
          onUnban={handleUnban}
          onDelete={handleDelete}
        />
      )}

      {/* ── Add Member Modal ── */}
      {showAdd && (
        <AddMemberModal
          gyms={gyms}
          plans={plans}
          onClose={() => setShowAdd(false)}
          onSaved={() => { fetchMembers(1, filterStatus, search); fetchMeta(); }}
        />
      )}
    </RoleDashboardLayout>
  );
}
