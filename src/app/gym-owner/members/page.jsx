"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { useAuth } from "@/context/AuthContext";
import { memberAPI, planAPI } from "@/lib/api";
import { UserPlus, Search, Download, Mail, Phone, QrCode, X, Check, RefreshCw, AlertCircle } from "lucide-react";

const statusCls = {
  Active:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Paused:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Banned:  "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

const EMPTY_FORM = { name: "", email: "", phone: "", plan: "", gender: "", age: "", address: "", emergencyContact: "", notes: "" };

export default function Page() {
  const { user, isDemo } = useAuth();

  const [members,      setMembers]      = useState([]);
  const [plans,        setPlans]        = useState([]);
  const [stats,        setStats]        = useState({ total: 0, active: 0, paused: 0, expired: 0 });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal,    setShowModal]    = useState(false);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [success,      setSuccess]      = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Fetch members from backend ─────────────────────────────────
  const fetchMembers = useCallback(async () => {
    if (isDemo) {
      // Demo mode — use hardcoded data
      const demo = [
        { _id: "M1024", name: "Rahul Sharma",  email: "rahul@example.com",  phone: "+91 98765 43210", planName: "Yearly",    status: "Active",  expiryDate: "2026-01-15", totalCheckins: 142 },
        { _id: "M1023", name: "Priya Mehta",   email: "priya@example.com",  phone: "+91 98765 43211", planName: "Quarterly", status: "Active",  expiryDate: "2025-04-12", totalCheckins: 89 },
        { _id: "M1022", name: "Amit Kumar",    email: "amit@example.com",   phone: "+91 98765 43212", planName: "Monthly",   status: "Paused",  expiryDate: "2025-02-28", totalCheckins: 34 },
        { _id: "M1021", name: "Sneha Patel",   email: "sneha@example.com",  phone: "+91 98765 43213", planName: "Day Pass",  status: "Active",  expiryDate: "2025-01-28", totalCheckins: 1 },
        { _id: "M1020", name: "Vikram Singh",  email: "vikram@example.com", phone: "+91 98765 43214", planName: "Yearly",    status: "Expired", expiryDate: "2024-11-05", totalCheckins: 210 },
        { _id: "M1019", name: "Neha Joshi",    email: "neha@example.com",   phone: "+91 98765 43215", planName: "Monthly",   status: "Active",  expiryDate: "2025-02-20", totalCheckins: 28 },
      ];
      setMembers(demo);
      setStats({ total: demo.length, active: demo.filter(m => m.status === "Active").length, paused: demo.filter(m => m.status === "Paused").length, expired: demo.filter(m => m.status === "Expired").length });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const params = { limit: 100 };
      if (filterStatus !== "All") params.status = filterStatus;
      if (search) params.search = search;

      const [membersRes, statsRes, plansRes] = await Promise.all([
        memberAPI.getAll(params),
        memberAPI.stats(),
        planAPI.getAll(),
      ]);

      setMembers(membersRes.data || []);
      setStats(statsRes.data || { total: 0, active: 0, paused: 0, expired: 0 });
      setPlans(plansRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [isDemo, filterStatus, search]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // ── Add member ─────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    setSaving(true);
    setError("");

    try {
      if (isDemo) {
        // Demo mode — just add to local state
        await new Promise(r => setTimeout(r, 600));
        const newMember = {
          _id: `demo_${Date.now()}`,
          name: form.name, email: form.email, phone: form.phone,
          planName: form.plan || "Monthly", status: "Active",
          expiryDate: null, totalCheckins: 0,
        };
        setMembers(p => [newMember, ...p]);
        setStats(p => ({ ...p, total: p.total + 1, active: p.active + 1 }));
      } else {
        // Real backend call
        const selectedPlan = plans.find(p => p.name === form.plan);
        const payload = {
          ...form,
          plan: selectedPlan?._id || undefined,
          planName: form.plan,
          age: form.age ? parseInt(form.age) : undefined,
        };
        const res = await memberAPI.create(payload);
        setMembers(p => [res.data, ...p]);
        setStats(p => ({ ...p, total: p.total + 1, active: p.active + 1 }));
      }

      setSaving(false);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); }, 1400);
    } catch (err) {
      setError(err.message || "Failed to add member");
      setSaving(false);
    }
  };

  // ── Filter locally for instant search ─────────────────────────
  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.includes(q);
    const matchStatus = filterStatus === "All" || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <RoleDashboardLayout
      title="My Members"
      navItems={GYM_OWNER_NAV}
      role="gym-owner"
      userName={user?.name || "Gym Admin"}
      userEmail={user?.email || ""}
      userAvatar={user?.avatar || "GA"}
    >
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">My Members</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              {user?.gym || "Your Gym"} — {stats.total} total members
              {isDemo && <span className="ml-2 text-amber-500 text-xs font-semibold">[Demo Mode]</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchMembers} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors" title="Refresh">
              <RefreshCw size={15} className="text-[var(--muted)]" />
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm">
              <UserPlus size={15} /> Add Member
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && !showModal && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total",         value: stats.total },
            { label: "Active",        value: stats.active },
            { label: "Paused",        value: stats.paused },
            { label: "Expired",       value: stats.expired },
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
            <input type="text" placeholder="Search by name, email or phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-[var(--text)] placeholder:text-[var(--muted2)]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Active", "Paused", "Expired"].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === f ? "bg-blue-600 text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface2)]"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>{["Name", "Contact", "Plan", "Status", "Expiry", "Check-ins", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center">
                    <span className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--muted)]">No members found</td></tr>
                ) : filtered.map(m => (
                  <tr key={m._id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {m.name?.split(" ").map(n => n[0]).join("") || "?"}
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
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">
                        {m.planName || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[m.status] || ""}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{formatDate(m.expiryDate)}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">{m.totalCheckins ?? 0}</td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="QR Code">
                        <QrCode size={14} className="text-blue-600" />
                      </button>
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
                <p className="text-xs text-[var(--muted)] mt-0.5">Fill in the details to register a new member</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setError(""); }}
                className="p-2 hover:bg-[var(--surface2)] rounded-lg transition-colors">
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
              <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
                    <AlertCircle size={13} />{error}
                  </div>
                )}

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
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
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

                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Membership Plan</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(plans.length > 0 ? plans.map(p => p.name) : ["Day Pass", "Weekly", "Monthly", "Quarterly", "Yearly"]).map(p => (
                      <button key={p} type="button" onClick={() => set("plan", p)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.plan === p ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-[var(--border)] text-[var(--muted)] hover:border-blue-300"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Additional Info</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Address</label>
                      <input type="text" placeholder="Full address" value={form.address} onChange={e => set("address", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Emergency Contact</label>
                      <input type="tel" placeholder="+91 98765 43210" value={form.emergencyContact} onChange={e => set("emergencyContact", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Notes</label>
                      <textarea rows={2} placeholder="Health conditions, injuries..." value={form.notes} onChange={e => set("notes", e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setError(""); }}
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
