"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { useAuth } from "@/context/AuthContext";
import { memberAPI, planAPI } from "@/lib/api";
import { confirmToast, showSuccess, showError } from "@/lib/toast";
import {
  UserPlus, Search, Mail, Phone, QrCode, X, Check,
  RefreshCw, AlertCircle, ChevronLeft, ChevronRight,
  User, Calendar, MapPin, Phone as PhoneIcon, Edit2, Trash2,
} from "lucide-react";

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
  const [viewMember,   setViewMember]   = useState(null); // profile modal
  const [qrMember,     setQrMember]     = useState(null); // QR modal
  const [qrLoading,    setQrLoading]    = useState(false);

  // Pagination states
  const [currentPage,  setCurrentPage]  = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
        { _id: "M1018", name: "Rajesh Kumar",  email: "rajesh@example.com", phone: "+91 98765 43216", planName: "Weekly",    status: "Active",  expiryDate: "2025-02-10", totalCheckins: 12 },
        { _id: "M1017", name: "Anita Desai",   email: "anita@example.com",  phone: "+91 98765 43217", planName: "Monthly",   status: "Active",  expiryDate: "2025-03-05", totalCheckins: 45 },
        { _id: "M1016", name: "Sunil Verma",   email: "sunil@example.com",  phone: "+91 98765 43218", planName: "Quarterly", status: "Paused",  expiryDate: "2025-02-15", totalCheckins: 67 },
        { _id: "M1015", name: "Deepa Nair",    email: "deepa@example.com",  phone: "+91 98765 43219", planName: "Yearly",    status: "Active",  expiryDate: "2025-08-20", totalCheckins: 156 },
        { _id: "M1014", name: "Arjun Reddy",   email: "arjun@example.com",  phone: "+91 98765 43220", planName: "Monthly",   status: "Expired", expiryDate: "2024-12-01", totalCheckins: 23 },
        { _id: "M1013", name: "Kavita Singh",  email: "kavita@example.com", phone: "+91 98765 43221", planName: "Weekly",    status: "Active",  expiryDate: "2025-02-12", totalCheckins: 8 },
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

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

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

  // ── Fetch QR code ──────────────────────────────────────────────
  const handleShowQR = async (e, member) => {
    e.stopPropagation();
    setQrMember({ ...member, qrCode: null });
    setQrLoading(true);
    try {
      const res = await memberAPI.getQR(member._id);
      setQrMember({ ...member, qrCode: res.data.qrCode });
    } catch {
      // Use member's existing qrCode if API fails
      setQrMember(member);
    } finally {
      setQrLoading(false);
    }
  };

  // ── Delete member ──────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    const confirmed = await confirmToast(`Remove "${name}" from members?`);
    if (!confirmed) return;
    try {
      await memberAPI.delete(id);
      setMembers(p => p.filter(m => m._id !== id));
      setStats(p => ({ ...p, total: Math.max(0, p.total - 1) }));
      setViewMember(null);
      showSuccess(`${name} removed.`);
    } catch (err) {
      showError(err.message || "Failed to remove member");
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

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filtered.slice(startIndex, endIndex);

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
                <tr>
                  {["Name", "Contact", "Plan", "Status", "Expiry", "Check-ins", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center">
                    <span className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </td></tr>
                ) : currentMembers.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--muted)]">No members found</td></tr>
                ) : currentMembers.map(m => (
                  <tr
                    key={m._id}
                    className="hover:bg-[var(--surface2)] transition-colors cursor-pointer"
                    onClick={() => setViewMember(m)}
                  >
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
                      <button
                        onClick={(e) => handleShowQR(e, m)}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer"
                        title="View QR Code"
                      >
                        <QrCode size={14} className="text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--surface2)]">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per page</span>
                <span className="ml-4">
                  Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} members
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MEMBER PROFILE MODAL ── */}
      {viewMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewMember(null)}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 relative rounded-t-2xl">
              <button onClick={() => setViewMember(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {viewMember.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{viewMember.name}</h2>
                  <p className="text-blue-200 text-sm mt-0.5">{viewMember.email}</p>
                  <span className={`inline-block mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${statusCls[viewMember.status] || "bg-gray-100 text-gray-600"}`}>
                    {viewMember.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Phone",       value: viewMember.phone || "—",                icon: PhoneIcon },
                  { label: "Plan",        value: viewMember.planName || "—",             icon: User },
                  { label: "Joined",      value: formatDate(viewMember.joinDate || viewMember.createdAt), icon: Calendar },
                  { label: "Expires",     value: formatDate(viewMember.expiryDate),      icon: Calendar },
                  { label: "Check-ins",   value: String(viewMember.totalCheckins ?? 0),  icon: Check },
                  { label: "Gender",      value: viewMember.gender || "—",               icon: User },
                ].map(f => (
                  <div key={f.label} className="bg-[var(--surface2)] rounded-xl px-4 py-3">
                    <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm font-medium text-[var(--text)] mt-0.5 truncate">{f.value}</p>
                  </div>
                ))}
              </div>

              {viewMember.address && (
                <div className="bg-[var(--surface2)] rounded-xl px-4 py-3">
                  <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Address</p>
                  <p className="text-sm text-[var(--text)]">{viewMember.address}</p>
                </div>
              )}

              {viewMember.notes && (
                <div className="bg-[var(--surface2)] rounded-xl px-4 py-3">
                  <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-[var(--text)]">{viewMember.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={(e) => { handleShowQR(e, viewMember); setViewMember(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                >
                  <QrCode size={15} /> View QR Code
                </button>
                <button
                  onClick={() => handleDelete(viewMember._id, viewMember.name)}
                  className="px-4 py-2.5 border border-red-200 text-red-500 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── QR CODE MODAL ── */}
      {qrMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setQrMember(null)}>
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">Member QR Code</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{qrMember.name}</p>
              </div>
              <button onClick={() => setQrMember(null)} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              {qrLoading ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : qrMember.qrCode ? (
                <img
                  src={qrMember.qrCode}
                  alt={`QR Code for ${qrMember.name}`}
                  className="w-48 h-48 rounded-xl border border-[var(--border)]"
                />
              ) : (
                <div className="w-48 h-48 bg-[var(--surface2)] rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2">
                  <QrCode size={40} className="text-[var(--muted2)]" />
                  <p className="text-xs text-[var(--muted)] text-center px-4">QR code will be generated when member is saved</p>
                </div>
              )}

              <div className="mt-4 text-center">
                <p className="font-bold text-[var(--text)]">{qrMember.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{qrMember.planName || "Member"} · {qrMember.status}</p>
              </div>

              {qrMember.qrCode && (
                <button
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = qrMember.qrCode;
                    a.download = `${qrMember.name.replace(/\s+/g, "_")}_QR.png`;
                    a.click();
                  }}
                  className="mt-4 w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                >
                  Download QR Code
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD MEMBER MODAL ── (unchanged) */}
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