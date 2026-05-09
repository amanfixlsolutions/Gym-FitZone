"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Phone, Loader2, Dumbbell } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fitzone-backend-vis3.onrender.com/api";

function CheckinForm() {
  const params  = useSearchParams();
  const gymId   = params.get("gym")  || "";
  const gymName = params.get("name") || "Your Gym";

  const [phone,    setPhone]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null); // { success, message, member, alreadyIn }
  const [error,    setError]    = useState("");

  // Show error immediately if gymId is missing in the URL
  const invalidQR = !gymId || gymId.trim() === "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || invalidQR) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${BASE_URL}/attendance/qr-checkin`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        // Send raw phone — backend normalizes to last 10 digits
        body:    JSON.stringify({ gymId: gymId.trim(), phone: phone.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Check-in failed. Please try again.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Invalid QR screen ──────────────────────────────────────────
  if (invalidQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Invalid QR Code</h1>
          <p className="text-sm text-gray-500">
            This QR code is missing gym information. Please ask your gym to regenerate the attendance QR code.
          </p>
        </div>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────
  if (result?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${result.alreadyIn ? "bg-amber-100" : "bg-emerald-100"}`}>
            <CheckCircle size={40} className={result.alreadyIn ? "text-amber-500" : "text-emerald-500"} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">
            {result.alreadyIn ? "Already Checked In!" : "Welcome! ✓"}
          </h1>
          <p className="text-lg font-bold text-blue-600 mb-1">{result.member?.name}</p>
          <p className="text-sm text-gray-500 mb-4">{result.member?.planName || "Member"}</p>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{result.message}</p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Dumbbell size={14} className="text-blue-500" />
            <span>FitZone · {gymName}</span>
          </div>

          <button
            onClick={() => { setResult(null); setPhone(""); }}
            className="mt-4 w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Check in another member
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Dumbbell size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-white">FitZone Check-in</h1>
          <p className="text-blue-200 text-sm mt-1">{decodeURIComponent(gymName)}</p>
        </div>

        {/* Form */}
        <div className="px-6 py-7">
          <p className="text-sm text-gray-600 text-center mb-5">
            Enter your registered phone number to mark your attendance
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Enter your 10-digit registered mobile number</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                : <><CheckCircle size={18} /> Mark Attendance</>}
            </button>
          </form>

          <p className="text-[10px] text-gray-400 text-center mt-4">
            Only registered members of this gym can check in.
            Your phone number must match your membership record.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <Loader2 size={40} className="text-white animate-spin" />
      </div>
    }>
      <CheckinForm />
    </Suspense>
  );
}
