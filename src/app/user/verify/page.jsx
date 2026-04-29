"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Dumbbell, Phone, ArrowRight, RefreshCw, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function OTPVerifyPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp | success
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) { setError("Enter a valid 10-digit phone number."); return; }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep("otp");
    setResendTimer(30);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the complete 6-digit OTP."); return; }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    // Accept any 6-digit OTP for demo
    setStep("success");
    setTimeout(() => {
      loginUser({ name: "Rahul Sharma", email: "rahul@example.com", phone, role: "user", avatar: "RS", plan: "Quarterly", gym: "Iron Paradise Fitness", planExpiry: "Apr 15, 2025" });
      router.push("/user");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Dumbbell size={20} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-[var(--text)]">FitZone</span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          {step === "phone" && (
            <>
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Phone size={26} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text)] text-center mb-1">Phone Verification</h2>
              <p className="text-[var(--muted)] text-center text-sm mb-7">We'll send a 6-digit OTP to your phone</p>

              {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

              <form onSubmit={sendOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-medium flex-shrink-0">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="flex-1 px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Phone size={26} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text)] text-center mb-1">Enter OTP</h2>
              <p className="text-[var(--muted)] text-center text-sm mb-1">
                Sent to <strong className="text-[var(--text)]">+91 {phone}</strong>
              </p>
              <button onClick={() => setStep("phone")} className="block mx-auto text-xs text-emerald-600 hover:text-emerald-700 font-medium mb-7">Change number</button>

              {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

              <form onSubmit={verifyOTP} className="space-y-6">
                {/* OTP boxes */}
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-bold bg-[var(--surface2)] border-2 rounded-xl text-[var(--text)] focus:outline-none transition-all ${digit ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-[var(--border)] focus:border-emerald-500"}`}
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading || otp.join("").length < 6} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Verify OTP</span><ArrowRight size={16} /></>}
                </button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-[var(--muted)]">Resend OTP in <strong className="text-[var(--text)]">{resendTimer}s</strong></p>
                  ) : (
                    <button type="button" onClick={() => { setResendTimer(30); setOtp(["","","","","",""]); }}
                      className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium hover:text-emerald-700 mx-auto">
                      <RefreshCw size={13} /> Resend OTP
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text)] mb-2">Verified!</h2>
              <p className="text-[var(--muted)] text-sm">Redirecting to your dashboard...</p>
              <div className="mt-4 w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          <Link href="/user/login" className="text-emerald-600 font-medium hover:text-emerald-700">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
