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
  X, Search, RefreshCw, Camera, CameraOff, Keyboard,
  AlertCircle, UserCheck,
} from "lucide-react";

// ── Color map (avoids dynamic Tailwind classes) ────────────────────
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

  // Scanner modal
  const [showScanner,  setShowScanner]  = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanResult,   setScanResult]   = useState(null);
  const [scanError,    setScanError]    = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Manual entry modal
  const [showManual,   setShowManual]   = useState(false);
  const [manualSearch, setManualSearch] = useState("");
  const [manualType,   setManualType]   = useState("Gym Access");
  const [checkingIn,   setCheckingIn]   = useState(null);

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

  // ── Auto-refresh every 30s ─────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Manual check-in ────────────────────────────────────────────
  const handleManualCheckin = async (member) => {
    setCheckingIn(member._id);
    try {
      await attendanceAPI.checkIn({
        memberId: member._id,
        type:     manualType,
        method:   "Manual",
      });
      showSuccess(`${member.name} checked in!`);
      setShowManual(false);
      setManualSearch("");
      fetchData();
    } catch (err) {
      showError(err.message || "Check-in failed");
    } finally {
      setCheckingIn(null);
    }
  };

  // ── QR Scanner (camera) ────────────────────────────────────────
  const startCamera = async () => {
    setScanError(""); setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setScanError("Camera access denied. Please allow camera permission or use Manual Entry.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const openScanner = () => { setShowScanner(true); setScanResult(null); setScanError(""); };
  const closeScanner = () => { stopCamera(); setShowScanner(false); };

  // ── QR code input (manual QR ID entry) ────────────────────────
  const handleQRInput = async (qrId) => {
    if (!qrId?.trim()) return;
    setScanResult({ loading: true });
    try {
      const res = await attendanceAPI.checkIn({ qrId: qrId.trim(), method: "QR" });
      setScanResult({ success: true, name: res.member?.name || "Member", plan: res.member?.plan || "" });
      showSuccess(`${res.member?.name || "Member"} checked in via QR!`);
      setTimeout(() => { setScanResult(null); fetchData(); }, 2000);
    } catch (err) {
      setScanResult({ error: err.message || "QR check-in failed" });
    }
  };

  // ── Filtered members for manual search ────────────────────────
  const filteredMembers = members.filter(m => {
    const q = manualSearch.toLowerCase();
    return !manualSearch || m.name?.toLowerCase().includes(q) || m.phone?.includes(q);
  }).slice(0, 10);

  // ── Stats ──────────────────────────────────────────────────────
  const currentlyInside = records.filter(r => r.status === "In").length;
  const peakHour = stats.daily?.length
    ? (() => {
        const max = stats.daily.reduce((a, b) => (b.count > a.count ? b : a), { count: 0 });
        return max.count > 0 ? new Date(max.date).toLocaleTimeString("en", { hour: "numeric" }) : "—";
      })()
    : "—";

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <RoleDashboardLayout title="Attendance" navItems={GYM_OWNER_NAV} role="gym-owner">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">QR Attendance</h1>
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

        {/* Chart + Scanner */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <AttendanceChart data={stats.daily} />
          </div>

          {/* QR Scanner card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
              <QrCode size={36} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-[var(--text)] mb-2">QR Scanner</h3>
            <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed">
              Members show their QR code at the entrance to check in/out instantly.
            </p>
            <button
              onClick={openScanner}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera size={16} /> Open Scanner
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
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                    No check-ins today yet
                   </td></tr>
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

      {/* ── QR SCANNER MODAL ── */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">QR Scanner</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Scan member QR code to check in</p>
              </div>
              <button onClick={closeScanner} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
                <X size={18} className="text-[var(--muted)]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Camera view */}
              <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                {!cameraActive && !scanError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Camera size={40} className="text-white/50" />
                    <p className="text-white/70 text-sm">Camera not started</p>
                  </div>
                )}
                {scanError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <CameraOff size={40} className="text-red-400" />
                    <p className="text-white/80 text-sm">{scanError}</p>
                  </div>
                )}
                {/* Scan overlay */}
                {cameraActive && !scanResult && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-blue-400 rounded-xl relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400/60 animate-pulse" />
                    </div>
                  </div>
                )}
                {/* Scan result */}
                {scanResult && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    {scanResult.loading ? (
                      <span className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : scanResult.success ? (
                      <div className="text-center">
                        <CheckCircle size={48} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-bold text-lg">{scanResult.name}</p>
                        <p className="text-white/70 text-sm">{scanResult.plan}</p>
                        <p className="text-emerald-400 text-sm font-semibold mt-1">Checked In!</p>
                      </div>
                    ) : (
                      <div className="text-center px-6">
                        <AlertCircle size={48} className="text-red-400 mx-auto mb-2" />
                        <p className="text-white font-bold">Check-in Failed</p>
                        <p className="text-white/70 text-sm mt-1">{scanResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Camera controls */}
              <div className="flex gap-3">
                {!cameraActive ? (
                  <button onClick={startCamera} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer">
                    <Camera size={16} /> Start Camera
                  </button>
                ) : (
                  <button onClick={stopCamera} className="flex-1 py-2.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold rounded-xl hover:bg-red-200 transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer">
                    <CameraOff size={16} /> Stop Camera
                  </button>
                )}
              </div>

              {/* Manual QR ID input */}
              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">Or enter QR ID manually</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste or type QR code ID..."
                    className="flex-1 px-3 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    onKeyDown={e => { if (e.key === "Enter") handleQRInput(e.target.value); }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousSibling;
                      handleQRInput(input?.value);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Check In
                  </button>
                </div>
                <p className="text-[10px] text-[var(--muted2)] mt-1.5">Press Enter or click Check In after entering the QR ID</p>
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
                <p className="text-xs text-[var(--muted)] mt-0.5">Search and check in a member manually</p>
              </div>
              <button onClick={() => setShowManual(false)} className="p-2 hover:bg-[var(--surface2)] rounded-lg cursor-pointer">
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

              {/* Member list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-sm text-[var(--muted)] py-4">
                    {manualSearch ? "No members found" : "Type to search members"}
                  </p>
                ) : filteredMembers.map(m => (
                  <div key={m._id} className="flex items-center justify-between p-3 bg-[var(--surface2)] rounded-xl hover:bg-[var(--surface3)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {m.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{m.name}</p>
                        <p className="text-xs text-[var(--muted)]">{m.planName || "Member"} · {m.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleManualCheckin(m)}
                      disabled={checkingIn === m._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      {checkingIn === m._id
                        ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        : <UserCheck size={13} />
                      }
                      Check In
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleDashboardLayout>
  );
}