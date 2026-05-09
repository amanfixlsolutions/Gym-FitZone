"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import { useAuth } from "@/context/AuthContext";
import { attendanceAPI, memberAPI } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import AttendanceChart from "@/components/AttendanceChart";
import {
  QrCode, CheckCircle, Clock, TrendingUp, Users,
  X, Search, RefreshCw, Keyboard, UserCheck,
  Download, RotateCcw,
} from "lucide-react";

// ── Color map ──────────────────────────────────────────────────────
const iconStyles = {
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/20", text: "text-emerald-600" },
  blue:    { bg: "bg-blue-100 dark:bg-blue-900/20",       text: "text-blue-600" },
  amber:   { bg: "bg-amber-100 dark:bg-amber-900/20",     text: "text-amber-600" },
  purple:  { bg: "bg-purple-100 dark:bg-purple-900/20",   text: "text-purple-600" },
};

export default function Page() {
  const { user } = useAuth();

  const [records,      setRecords]      = useState([]);
  const [stats,        setStats]        = useState({ todayCount: 0, weekCount: 0, monthCount: 0, daily: [] });
  const [members,      setMembers]      = useState([]);
  const [loading,      setLoading]      = useState(true);

  // QR Generator — ONE QR for the whole gym
  const [qrDataUrl,    setQrDataUrl]    = useState("");
  const [qrGenerating, setQrGenerating] = useState(false);
  const [showQRModal,  setShowQRModal]  = useState(false);

  // Manual entry modal
  const [showManual,   setShowManual]   = useState(false);
  const [manualSearch, setManualSearch] = useState("");
  const [manualType,   setManualType]   = useState("Gym Access");
  const [checkingIn,   setCheckingIn]   = useState(null);
  const [selected,     setSelected]     = useState(new Set());
  const [bulkChecking, setBulkChecking] = useState(false);

  // ── Fetch attendance data ──────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const [recordsRes, statsRes, membersRes] = await Promise.all([
        attendanceAPI.getAll({ date: today, limit: 50 }),
        attendanceAPI.stats(),
        memberAPI.getAll({ status: "Active", limit: 200 }),
      ]);
      setRecords(recordsRes.data || []);
      setStats(statsRes.data || {});
      setMembers(membersRes.data || []);
    } catch (err) {
      if (!err.message?.includes("session")) showError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Generate QR for the whole gym ────────────────────────────
  // This is a DISPLAY QR shown on screen / printed at gym entrance.
  // When a member scans it with their phone camera, it opens:
  //   /checkin?qrId=<memberQrId>&name=<gymName>
  //
  // BUT — this is the GYM-level QR (not member-specific).
  // For member-specific QR, gym owner uses the Members page → QR icon.
  //
  // This gym QR encodes a URL that tells members to use their
  // personal QR code. It also supports direct qrId in URL for
  // scanner devices that can read member QR and redirect here.
  const generateGymQR = async () => {
    setQrGenerating(true);
    try {
      const QRCode = (await import("qrcode")).default;

      // Resolve gymId and gymName
      let gymId   = user?.gym || user?.gymId || "";
      let gymName = user?.gymName || "";

      if (!gymId) {
        try {
          const { authAPI } = await import("@/lib/api");
          const meData = await authAPI.getMe();
          const u = meData?.user;
          if (u?.gym && typeof u.gym === "object") {
            gymId   = String(u.gym._id  || "");
            gymName = gymName || String(u.gym.name || "");
          } else if (u?.gym) {
            gymId   = String(u.gym);
            gymName = gymName || u?.gymName || "";
          }
        } catch { /* silent */ }
      }

      if (!gymId) {
        showError("Gym ID not found. Please log out and log in again.");
        return;
      }
      if (!gymName) gymName = "Your Gym";

      const BASE = typeof window !== "undefined"
        ? window.location.origin
        : "https://gym-fit-zone.vercel.app";

      // Gym-level QR → opens /checkin page with gym context
      // Member's personal QR (from Members page) encodes their qrId directly
      const url = `${BASE}/checkin?name=${encodeURIComponent(gymName)}`;

      const dataUrl = await QRCode.toDataURL(url, {
        width:                300,
        margin:               2,
        color:                { dark: "#1e1b4b", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });

      setQrDataUrl(dataUrl);
      setShowQRModal(true);
    } catch {
      showError("Failed to generate QR code");
    } finally {
      setQrGenerating(false);
    }
  };

  // ── Download QR ────────────────────────────────────────────────
  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href     = qrDataUrl;
    a.download = `gym-attendance-qr-${new Date().toISOString().split("T")[0]}.png`;
    a.click();
  };

  // ── Manual check-in (single) ──────────────────────────────────
  const handleManualCheckin = async (member) => {
    setCheckingIn(member._id);
    try {
      await attendanceAPI.checkIn({ memberId: member._id, type: manualType, method: "Manual" });
      showSuccess(`${member.name} checked in!`);
      setSelected(prev => { const s = new Set(prev); s.delete(member._id); return s; });
      fetchData();
    } catch (err) {
      showError(err.message || "Check-in failed");
    } finally {
      setCheckingIn(null);
    }
  };

  // ── Bulk check-in ──────────────────────────────────────────────
  const handleBulkCheckin = async () => {
    if (selected.size === 0) return;
    setBulkChecking(true);
    const selectedMembers = members.filter(m => selected.has(m._id));
    let successCount = 0, failCount = 0;

    await Promise.allSettled(
      selectedMembers.map(async (m) => {
        try {
          await attendanceAPI.checkIn({ memberId: m._id, type: manualType, method: "Manual" });
          successCount++;
        } catch { failCount++; }
      })
    );

    if (successCount > 0) showSuccess(`${successCount} member${successCount > 1 ? "s" : ""} checked in!`);
    if (failCount    > 0) showError(`${failCount} check-in${failCount > 1 ? "s" : ""} failed`);

    setSelected(new Set());
    setShowManual(false);
    setManualSearch("");
    fetchData();
    setBulkChecking(false);
  };

  const toggleSelect  = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const selectAll     = ()   => setSelected(new Set(filteredMembers.map(m => m._id)));
  const clearSelection = ()  => setSelected(new Set());

  // ── Filtered members ───────────────────────────────────────────
  const filteredMembers = members.filter(m => {
    const q = manualSearch.toLowerCase();
    return !manualSearch || m.name?.toLowerCase().includes(q) || m.phone?.includes(q);
  }).slice(0, 10);

  const currentlyInside = records.filter(r => r.status === "In").length;
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <RoleDashboardLayout title="Attendance" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Attendance</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">Real-time member check-in/out tracking</p>
          </div>
          <button onClick={fetchData} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer" title="Refresh">
            <RefreshCw size={15} className={`text-[var(--muted)] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Check-ins Today",  value: stats.todayCount || 0,  icon: CheckCircle, color: "emerald" },
            { label: "Currently Inside", value: currentlyInside,         icon: Users,       color: "blue" },
            { label: "This Week",        value: stats.weekCount  || 0,  icon: TrendingUp,  color: "amber" },
            { label: "This Month",       value: stats.monthCount || 0,  icon: Clock,       color: "purple" },
          ].map(s => {
            const style = iconStyles[s.color];
            return (
              <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center mb-3`}>
                  <s.icon size={16} className={style.text} />
                </div>
                <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value.toLocaleString()}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Chart + QR Generator card */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <AttendanceChart data={stats.daily} />
          </div>

          {/* QR Generator card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
              <QrCode size={36} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-[var(--text)] mb-1">Attendance QR Code</h3>
            <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed">
              One QR for all members. Any registered member scans it, enters their phone, and attendance is marked automatically.
            </p>
            <button
              onClick={generateGymQR}
              disabled={qrGenerating}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {qrGenerating
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <QrCode size={16} />}
              {qrGenerating ? "Generating..." : "Generate Gym QR"}
            </button>
            <button
              onClick={() => { setShowManual(true); setManualSearch(""); }}
              className="w-full mt-2 border border-[var(--border)] text-[var(--text)] py-2.5 rounded-xl font-medium text-sm hover:bg-[var(--surface2)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Keyboard size={16} /> Manual Entry
            </button>
          </div>
        </div>

        {/* Today's log */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <p className="font-semibold text-[var(--text)]">Today's Check-in Log</p>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-[var(--surface2)] border-b border-[var(--border)]">
                <tr>
                  {["Member", "Time", "Plan", "Activity", "Method", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center">
                    <span className="inline-block w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--muted)]">No check-ins today yet</td></tr>
                ) : records.map((r, i) => (
                  <tr key={r._id || i} className="hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(r.memberName || "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium text-[var(--text)] whitespace-nowrap">{r.memberName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{formatTime(r.checkInTime)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-medium whitespace-nowrap">
                        {r.memberPlan || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] whitespace-nowrap">{r.type || "Gym Access"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${r.method === "QR" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {r.method || "Manual"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${r.status === "In" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {r.status === "In" ? "✓ Checked In" : "Checked Out"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {records.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[var(--border)] text-xs text-[var(--muted2)]">
              {records.length} records today
            </div>
          )}
        </div>
      </div>

      {/* ── QR CODE MODAL ── */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">Gym Attendance QR</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Valid for today · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
              {/* QR Image */}
              {qrDataUrl ? (
                <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
                  <img src={qrDataUrl} alt="Gym Attendance QR" className="w-56 h-56 object-contain" />
                </div>
              ) : (
                <div className="w-56 h-56 bg-[var(--surface2)] rounded-2xl flex items-center justify-center">
                  <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              )}

              {/* How it works */}
              {/* <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 space-y-1.5">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">How it works</p>
                {[
                  "Member scans this QR with their phone camera",
                  "Enters their registered phone number",
                  "Backend verifies they are an Active member",
                  "Attendance is marked instantly",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-blue-700 dark:text-blue-300">{step}</p>
                  </div>
                ))}
              </div> */}

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm cursor-pointer">
                  <Download size={15} /> Download
                </button>
                <button onClick={generateGymQR} disabled={qrGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--surface2)] text-[var(--text)] font-semibold rounded-xl hover:bg-[var(--border)] transition-colors text-sm cursor-pointer disabled:opacity-60">
                  {qrGenerating
                    ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    : <RotateCcw size={15} />}
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MANUAL ENTRY MODAL ── */}
      {showManual && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">Manual Check-in</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Search and check in members manually</p>
              </div>
              <button onClick={() => { setShowManual(false); setSelected(new Set()); }} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Activity type */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-2">Activity Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Gym Access", "Class", "Personal Training"].map(t => (
                    <button key={t} type="button" onClick={() => setManualType(t)}
                      className={`py-2 rounded-xl text-xs font-medium border-2 transition-all cursor-pointer ${manualType === t ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-[var(--border)] text-[var(--muted)] hover:border-blue-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Search Member</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                  <input
                    type="text"
                    placeholder="Name or phone number..."
                    value={manualSearch}
                    onChange={e => setManualSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Select all / clear */}
              {filteredMembers.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={selectAll}
                      className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
                      Select All ({filteredMembers.length})
                    </button>
                    {selected.size > 0 && (
                      <button type="button" onClick={clearSelection}
                        className="text-xs text-[var(--muted)] hover:underline cursor-pointer">
                        Clear
                      </button>
                    )}
                  </div>
                  {selected.size > 0 && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                      {selected.size} selected
                    </span>
                  )}
                </div>
              )}

              {/* Member list with checkboxes */}
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-sm text-[var(--muted)] py-4">
                    {manualSearch ? "No members found" : "Type to search members"}
                  </p>
                ) : filteredMembers.map(m => {
                  const isSelected = selected.has(m._id);
                  const isChecking = checkingIn === m._id;
                  return (
                    <div
                      key={m._id}
                      onClick={() => toggleSelect(m._id)}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400"
                          : "bg-[var(--surface2)] border-2 border-transparent hover:border-blue-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? "bg-blue-600 border-blue-600" : "border-[var(--border)] bg-[var(--surface)]"
                        }`}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {m.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">{m.name}</p>
                          <p className="text-xs text-[var(--muted)]">{m.planName || "Member"} · {m.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleManualCheckin(m); }}
                        disabled={isChecking || bulkChecking}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer flex-shrink-0"
                        title="Check in this member only"
                      >
                        {isChecking
                          ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          : <UserCheck size={13} />}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bulk check-in */}
              {selected.size > 0 && (
                <button
                  onClick={handleBulkCheckin}
                  disabled={bulkChecking}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {bulkChecking
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <UserCheck size={16} />}
                  {bulkChecking ? "Checking in..." : `Check In ${selected.size} Member${selected.size > 1 ? "s" : ""}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}
