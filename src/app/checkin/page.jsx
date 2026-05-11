"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle, AlertCircle, Loader2,
  Dumbbell, Phone, QrCode,
} from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fitzone-backend-vis3.onrender.com/api";

// ─────────────────────────────────────────────────────────────────
// TWO flows handled on this page:
//
// FLOW A — Gym QR (one QR for all members):
//   URL: /checkin?gym=<gymId>&name=<gymName>
//   → Show phone number form
//   → POST { gymId, phone } → backend finds member by phone
//
// FLOW B — Member personal QR:
//   URL: /checkin?qrData=<encoded-json>  OR  ?qrId=<uuid>
//   → Auto-submit immediately, no input needed
//   → POST { qrData } → backend finds member by qrId
// ─────────────────────────────────────────────────────────────────

function CheckinContent() {
  const params = useSearchParams();

  const gymId        = (params.get("gym")      || "").trim();
  const gymName      = decodeURIComponent(params.get("name") || "Your Gym");
  const qrDataParam  = (params.get("qrData")   || "").trim();
  const qrIdParam    = (params.get("qrId")     || "").trim();
  const memberIdParam= (params.get("memberId") || "").trim();

  // Determine which flow
  const isGymQR    = !!gymId && !qrDataParam && !qrIdParam && !memberIdParam;
  const isMemberQR = !!(qrDataParam || qrIdParam || memberIdParam);

  const [phone,   setPhone]   = useState("");
  const [status,  setStatus]  = useState("idle"); // idle|loading|success|error|already
  const [message, setMessage] = useState("");
  const [member,  setMember]  = useState(null);

  // ── FLOW B: auto-submit on mount ──────────────────────────────
  useEffect(() => {
    if (isMemberQR) {
      const body = {};
      if (qrDataParam)   body.qrData   = qrDataParam;
      if (qrIdParam)     body.qrId     = qrIdParam;
      if (memberIdParam) body.memberId = memberIdParam;
      doCheckin(body);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core checkin API call ─────────────────────────────────────
  const doCheckin = async (body) => {
    setStatus("loading");
    setMessage("");
    try {
      const res  = await fetch(`${BASE_URL}/attendance/qr-checkin`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Check-in failed. Please try again.");
      } else if (data.alreadyIn) {
        setStatus("already");
        setMessage(data.message);
        setMember(data.member);
      } else {
        setStatus("success");
        setMessage(data.message);
        setMember(data.member);
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  // ── FLOW A: phone form submit ─────────────────────────────────
  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const raw = phone.trim();
    if (!raw) return;
    doCheckin({ gymId, phone: raw });
  };

  // ── Shared result screens ─────────────────────────────────────
  if (status === "loading") {
    return (
      <Screen bg="from-blue-600 to-indigo-700">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Verifying...</h1>
          <p className="text-sm text-gray-500">Checking your membership</p>
        </div>
      </Screen>
    );
  }

  if (status === "success") {
    return (
      <Screen bg="from-emerald-50 to-teal-100">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Welcome! ✓</h1>
          <p className="text-lg font-bold text-blue-600 mb-1">{member?.name}</p>
          <p className="text-sm text-gray-500 mb-4">{member?.planName || "Member"}</p>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{message}</p>
          <Footer gymName={gymName} />
          {isGymQR && (
            <button onClick={() => { setStatus("idle"); setPhone(""); setMember(null); }}
              className="mt-4 w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Check in another member
            </button>
          )}
        </div>
      </Screen>
    );
  }

  if (status === "already") {
    return (
      <Screen bg="from-amber-50 to-orange-100">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Already Checked In!</h1>
          <p className="text-lg font-bold text-blue-600 mb-1">{member?.name}</p>
          <p className="text-sm text-gray-500 mb-4">{member?.planName || "Member"}</p>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{message}</p>
          <Footer gymName={gymName} />
          {isGymQR && (
            <button onClick={() => { setStatus("idle"); setPhone(""); setMember(null); }}
              className="mt-4 w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Check in another member
            </button>
          )}
        </div>
      </Screen>
    );
  }

  if (status === "error") {
    return (
      <Screen bg="from-red-50 to-rose-100">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Check-in Failed</h1>
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{message}</p>
          <Footer gymName={gymName} />
          {isGymQR && (
            <button onClick={() => { setStatus("idle"); setPhone(""); }}
              className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              Try Again
            </button>
          )}
        </div>
      </Screen>
    );
  }

  // ── FLOW A idle: phone number form ────────────────────────────
  if (isGymQR) {
    return (
      <Screen bg="from-blue-600 to-indigo-700">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Dumbbell size={32} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-white">FitZone Check-in</h1>
            <p className="text-blue-200 text-sm mt-1">{gymName}</p>
          </div>

          {/* Form */}
          <div className="px-6 py-7">
            <p className="text-sm text-gray-600 text-center mb-5">
              Enter your registered mobile number to mark attendance
            </p>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210"
                    autoFocus
                    inputMode="numeric"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Use the same number registered with your gym membership
                </p>
              </div>
              <button
                type="submit"
                disabled={!phone.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> Mark Attendance
              </button>
            </form>
            <p className="text-[10px] text-gray-400 text-center mt-4">
              Only registered members of this gym can check in.
            </p>
          </div>
        </div>
      </Screen>
    );
  }

  // ── No QR data at all (direct page visit) ─────────────────────
  return (
    <Screen bg="from-blue-600 to-indigo-700">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <QrCode size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-white">FitZone Check-in</h1>
          <p className="text-blue-200 text-sm mt-1">{gymName}</p>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-gray-600 text-sm leading-relaxed">
            Please scan the gym QR code using your phone camera to mark attendance.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Contact your gym if you need help.
          </p>
        </div>
      </div>
    </Screen>
  );
}

// ── Helpers ───────────────────────────────────────────────────────
function Screen({ bg, children }) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${bg} flex items-center justify-center p-4`}>
      {children}
    </div>
  );
}

function Footer({ gymName }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
      <Dumbbell size={14} className="text-blue-500" />
      <span>FitZone · {gymName}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
export default function CheckinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
        <Loader2 size={40} className="text-white animate-spin" />
      </div>
    }>
      <CheckinContent />
    </Suspense>
  );
}
