"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { attendanceAPI } from "@/lib/api";
import { CheckCircle, XCircle, QrCode, Phone, Loader2 } from "lucide-react";

// ── Inner component that uses useSearchParams ──────────────────────
function CheckinForm() {
  const searchParams = useSearchParams();
  const gymId   = searchParams.get("gym")  || "";
  const gymName = searchParams.get("name") || "Your Gym";

  const [phone,   setPhone]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null); // { success, message, alreadyIn, member }
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await attendanceAPI.qrCheckin({ gymId, phone: phone.trim() });
      setResult(res);
    } catch (err) {
      setError(err.message || "Check-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-reset after 8 seconds so next member can use it
  useEffect(() => {
    if (result) {
      const t = setTimeout(() => { setResult(null); setPhone(""); setError(""); }, 8000);
      return () => clearTimeout(t);
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <QrCode size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">FitZone</h1>
          <p className="text-blue-200 text-sm mt-1">{gymName}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Success state */}
          {result?.success && !result?.alreadyIn && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={44} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-black text-gray-800">Welcome!</h2>
              <p className="text-2xl font-bold text-blue-600 mt-1">{result.member?.name}</p>
              <p className="text-gray-500 text-sm mt-1">{result.member?.planName}</p>
              <div className="mt-4 bg-emerald-50 rounded-2xl px-4 py-3">
                <p className="text-emerald-700 font-semibold text-sm">✓ Attendance Marked!</p>
                <p className="text-emerald-600 text-xs mt-0.5">
                  {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <p className="text-gray-400 text-xs mt-4">This screen resets in 8 seconds</p>
            </div>
          )}

          {/* Already checked in */}
          {result?.alreadyIn && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={44} className="text-amber-500" />
              </div>
              <h2 className="text-xl font-black text-gray-800">{result.member?.name}</h2>
              <div className="mt-4 bg-amber-50 rounded-2xl px-4 py-3">
                <p className="text-amber-700 font-semibold text-sm">Already checked in today!</p>
              </div>
              <p className="text-gray-400 text-xs mt-4">This screen resets in 8 seconds</p>
            </div>
          )}

          {/* Form state */}
          {!result && (
            <div className="p-8">
              <h2 className="text-xl font-black text-gray-800 text-center mb-1">Check In</h2>
              <p className="text-gray-500 text-sm text-center mb-6">Enter your registered phone number</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoFocus
                    required
                    className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 text-gray-800 placeholder:text-gray-400 transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                    <XCircle size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !phone.trim()}
                  className="w-full py-4 bg-blue-600 text-white font-bold text-base rounded-2xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 size={20} className="animate-spin" /> Verifying...</>
                    : "Mark Attendance"}
                </button>
              </form>

              <p className="text-center text-gray-400 text-xs mt-5">
                Only registered members of this gym can check in
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-blue-200/60 text-xs mt-6">Powered by FitZone</p>
      </div>
    </div>
  );
}

// ── Page wrapper with Suspense (required for useSearchParams) ──────
export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
        <Loader2 size={40} className="text-white animate-spin" />
      </div>
    }>
      <CheckinForm />
    </Suspense>
  );
}
