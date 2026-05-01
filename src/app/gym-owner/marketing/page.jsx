"use client";
import { useState, useEffect, useCallback } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { campaignAPI } from "@/lib/api";
import { confirmToast, showSuccess, showError } from "@/lib/toast";
import {
  Megaphone, Send, Users, Tag, Plus, TrendingUp,
  X, Check, RefreshCw, AlertCircle, Edit2, Trash2,
  Clock, CheckCircle, FileText,
} from "lucide-react";

const statusCls = {
  Sent:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Draft:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Failed:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const TARGETS  = ["All Members", "Active Members", "Expiring Soon", "Inactive Members", "New Members"];
const CHANNELS = ["Email", "SMS", "WhatsApp", "In-App", "All Channels"];

const EMPTY_FORM = { title: "", message: "", target: "All Members", channel: "Email", status: "Draft", scheduledAt: "" };
const EMPTY_BROADCAST = { title: "", message: "", target: "All Members", channel: "In-App" };

const inputCls = "w-full px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

export default function Page() {
  const [campaigns,  setCampaigns]  = useState([]);
  const [stats,      setStats]      = useState({ total: 0, sent: 0, totalReach: 0, avgOpenRate: 0, activePromos: 0 });
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [broadcast,  setBroadcast]  = useState(EMPTY_BROADCAST);
  const [saving,     setSaving]     = useState(false);
  const [sending,    setSending]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [errors,     setErrors]     = useState({});

  const set  = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setB = (k, v) => setBroadcast(p => ({ ...p, [k]: v }));

  // ── Fetch campaigns ────────────────────────────────────────────
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await campaignAPI.getAll({ limit: 50 });
      setCampaigns(res.data || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // ── Validate form ──────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = "Title is required";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Open modals ────────────────────────────────────────────────
  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setErrors({}); setSuccess(false); setShowModal(true); };
  const openEdit = (c) => {
    setEditId(c._id);
    setForm({ title: c.title, message: c.message, target: c.target, channel: c.channel, status: c.status, scheduledAt: c.scheduledAt ? c.scheduledAt.slice(0, 16) : "" });
    setErrors({}); setSuccess(false); setShowModal(true);
  };

  // ── Submit campaign ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await campaignAPI.update(editId, form);
        setCampaigns(p => p.map(c => c._id === editId ? res.data : c));
        showSuccess(`"${form.title}" updated!`);
      } else {
        const res = await campaignAPI.create(form);
        setCampaigns(p => [res.data, ...p]);
        showSuccess(`"${form.title}" ${form.status === "Sent" ? "sent!" : "saved as draft!"}`);
      }
      setSaving(false); setSuccess(true);
      setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM); fetchCampaigns(); }, 1400);
    } catch (err) {
      showError(err.message || "Failed to save campaign");
      setSaving(false);
    }
  };

  // ── Delete campaign ────────────────────────────────────────────
  const handleDelete = async (id, title) => {
    const confirmed = await confirmToast(`Delete "${title}" campaign?`);
    if (!confirmed) return;
    try {
      await campaignAPI.delete(id);
      setCampaigns(p => p.filter(c => c._id !== id));
      showSuccess(`"${title}" deleted.`);
    } catch (err) {
      showError(err.message || "Failed to delete");
    }
  };

  // ── Quick broadcast ────────────────────────────────────────────
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcast.title.trim() || !broadcast.message.trim()) {
      showError("Title and message are required.");
      return;
    }
    setSending(true);
    try {
      const res = await campaignAPI.broadcast(broadcast);
      showSuccess(res.message || "Campaign sent successfully!");
      setBroadcast(EMPTY_BROADCAST);
      fetchCampaigns();
    } catch (err) {
      showError(err.message || "Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <RoleDashboardLayout title="Marketing" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Marketing</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Campaigns, offers and lead management</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchCampaigns} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer" title="Refresh">
              <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer shadow-sm">
              <Plus size={15} /> New Campaign
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Campaigns Sent", value: stats.sent,                                icon: Megaphone },
            { label: "Total Reach",    value: (stats.totalReach || 0).toLocaleString(),  icon: Users },
            { label: "Avg Open Rate",  value: `${stats.avgOpenRate || 0}%`,              icon: TrendingUp },
            { label: "Active Promos",  value: stats.activePromos || 0,                   icon: Tag },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                <s.icon size={16} className="text-blue-600" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Broadcast */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Send size={16} className="text-blue-600" />
            <p className="font-semibold text-[var(--text)]">Quick Broadcast</p>
            <span className="text-xs text-[var(--muted)] bg-[var(--surface2)] px-2 py-0.5 rounded-full">Sends immediately</span>
          </div>
          <form onSubmit={handleBroadcast}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Target Audience</label>
                <select value={broadcast.target} onChange={e => setB("target", e.target.value)} className={inputCls}>
                  {TARGETS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Channel</label>
                <select value={broadcast.channel} onChange={e => setB("channel", e.target.value)} className={inputCls}>
                  {CHANNELS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Title <span className="text-red-500">*</span></label>
                <input type="text" value={broadcast.title} onChange={e => setB("title", e.target.value)} placeholder="Campaign title..." className={inputCls} />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Message <span className="text-red-500">*</span></label>
              <textarea rows={2} value={broadcast.message} onChange={e => setB("message", e.target.value)} placeholder="Write your message..." className={`${inputCls} resize-none`} />
            </div>
            <div className="flex justify-end mt-3">
              <button type="submit" disabled={sending} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm font-medium cursor-pointer">
                {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                {sending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </form>
        </div>

        {/* Campaigns Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">All Campaigns</p>
            <span className="text-xs text-[var(--muted)]">{campaigns.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Campaign", "Target", "Channel", "Sent", "Opened", "Date", "Status", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center">
                    <span className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </td></tr>
                ) : campaigns.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-[var(--muted)]">
                    <Megaphone size={32} className="mx-auto mb-2 opacity-30" />
                    No campaigns yet. Create your first campaign!
                  </td></tr>
                ) : campaigns.map(c => (
                  <tr key={c._id} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text)] whitespace-nowrap">{c.title}</p>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate max-w-[160px]">{c.message}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap text-xs">{c.target}</td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap text-xs">{c.channel}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">
                      {c.sentCount > 0 ? c.sentCount.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold text-xs">
                      {c.openedCount > 0 && c.sentCount > 0
                        ? `${c.openedCount} (${Math.round((c.openedCount / c.sentCount) * 100)}%)`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap text-xs">
                      {c.status === "Sent" ? formatDate(c.sentAt) : c.status === "Scheduled" ? formatDate(c.scheduledAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCls[c.status] || ""}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {c.status === "Draft" && (
                          <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer" title="Edit">
                            <Edit2 size={13} className="text-blue-600" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(c._id, c.title)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer" title="Delete">
                          <Trash2 size={13} className="text-red-500" />
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

      {/* ── NEW / EDIT CAMPAIGN MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{editId ? "Edit Campaign" : "New Campaign"}</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">{editId ? "Update campaign details" : "Create a new marketing campaign"}</p>
              </div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setErrors({}); }} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-[var(--text)]">{editId ? "Campaign Updated!" : "Campaign Created!"}</p>
                <p className="text-sm text-[var(--muted)] mt-1">"{form.title}" has been {form.status === "Sent" ? "sent" : "saved"}.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Campaign Title <span className="text-red-500">*</span></label>
                  <input type="text" value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. New Year Special Offer" className={inputCls} />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Target Audience</label>
                    <select value={form.target} onChange={e => set("target", e.target.value)} className={inputCls}>
                      {TARGETS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Channel</label>
                    <select value={form.channel} onChange={e => set("channel", e.target.value)} className={inputCls}>
                      {CHANNELS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Message <span className="text-red-500">*</span></label>
                  <textarea rows={4} value={form.message} onChange={e => set("message", e.target.value)} placeholder="Write your campaign message here..." className={`${inputCls} resize-none`} />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  <p className="text-[10px] text-[var(--muted2)] mt-1">{form.message.length} characters</p>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-2">Send Options</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: "Draft",     label: "Save Draft",  icon: FileText },
                      { v: "Sent",      label: "Send Now",    icon: Send },
                      { v: "Scheduled", label: "Schedule",    icon: Clock },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => set("status", opt.v)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all cursor-pointer ${form.status === opt.v ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-[var(--border)] text-[var(--muted)] hover:border-blue-300"}`}
                      >
                        <opt.icon size={16} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.status === "Scheduled" && (
                  <div>
                    <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Schedule Date & Time</label>
                    <input type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} className={inputCls} min={new Date().toISOString().slice(0, 16)} />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setErrors({}); }}
                    className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text)] font-medium rounded-xl hover:bg-[var(--surface2)] transition-colors text-sm cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    {saving ? "Saving..." : editId ? "Update Campaign" : form.status === "Sent" ? "Send Campaign" : "Save Campaign"}
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
