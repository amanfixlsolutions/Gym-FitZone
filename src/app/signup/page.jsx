"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/lib/api";
import {
  Dumbbell, Eye, EyeOff, Lock, Mail, User, Phone,
  ArrowRight, CheckCircle, Loader2, ShieldCheck,
  RefreshCw, Zap,
} from "lucide-react";

// ── Steps ──────────────────────────────────────────────────────────
// 1 = enter email  →  2 = verify OTP  →  3 = fill details  →  done

const OTP_LENGTH = 6;
const OTP_RESEND_SECS = 60;

export default function SignupPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [step,        setStep]        = useState(1);
  const [email,       setEmail]       = useState("");
  const [otp,         setOtp]         = useState(Array(OTP_LENGTH).fill(""));
  const [verifyToken, setVerifyToken] = useState("");
  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showCPw,     setShowCPw]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [resendSecs,  setResendSecs]  = useState(0);
  const [done,        setDone]        = useState(false);
  const [demoOtp,     setDemoOtp]     = useState(""); // shown when email not configured

  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  // ── Resend countdown ───────────────────────────────────────────
  useEffect(() => {
    if (resendSecs <= 0) return;
    timerRef.current = setInterval(() => {
      setResendSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [resendSecs]);

  // ── Step 1: Send OTP ───────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError("");
    try {
      await authAPI.sendOTP(email.trim().toLowerCase(), "signup");
      setStep(2);
      setResendSecs(OTP_RESEND_SECS);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling ─────────────────────────────────────────
  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(""));
      otpRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) { setError("Enter the complete 6-digit OTP."); return; }
    setLoading(true); setError("");
    try {
      const res = await authAPI.verifyOTP(email.trim().toLowerCase(), code, "signup");
      setVerifyToken(res.verifyToken);
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendSecs > 0) return;
    setLoading(true); setError("");
    try {
      await authAPI.sendOTP(email.trim().toLowerCase(), "signup");
      setOtp(Array(OTP_LENGTH).fill(""));
      setDemoOtp("");
      setResendSecs(OTP_RESEND_SECS);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Register ───────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim())              { setError("Full name is required."); return; }
    if (password.length < 6)       { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPw)    { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      await authAPI.register({
        name:        name.trim(),
        email:       email.trim().toLowerCase(),
        password,
        phone:       phone.trim(),
        verifyToken,
        role:        "member",
      });
      // Auto-login after registration
      await loginUser(email.trim().toLowerCase(), password);
      setDone(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ──────────────────────────────────────────
  const pwStrength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 6)  score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak",   color: "bg-red-500",    w: "w-1/4" };
    if (score <= 2) return { label: "Fair",   color: "bg-amber-500",  w: "w-2/4" };
    if (score <= 3) return { label: "Good",   color: "bg-blue-500",   w: "w-3/4" };
    return              { label: "Strong", color: "bg-emerald-500", w: "w-full" };
  })();

  // ── Success screen ─────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Welcome to FitZone! 🎉</h2>
          <p className="text-gray-500 text-sm">Account created successfully. Redirecting...</p>
          <div className="mt-4 flex justify-center">
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#ffffff", colorScheme: "light" }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <Dumbbell size={22} className="text-white" />
          </div>
          <div>
            <p className="font-black text-xl text-white tracking-tight">FitZone</p>
            <p className="text-orange-100 text-xs">Gym Management Platform</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap size={12} /> Join 5,000+ active members
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Start your<br />fitness journey<br />today.
          </h1>
          <p className="text-orange-100 text-base leading-relaxed mb-8">
            Get access to world-class trainers, live classes, and a community that keeps you motivated.
          </p>

          {/* Benefits */}
          <div className="space-y-3">
            {[
              "Access to all gym classes",
              "Personal trainer sessions",
              "Live Zoom fitness classes",
              "Progress tracking & analytics",
              "24/7 gym access",
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={12} className="text-white" />
                </div>
                <span className="text-white text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-orange-200 text-xs relative z-10">© 2025 FitZone. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-black text-xl text-gray-800">FitZone</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step > s  ? "bg-emerald-500 text-white" :
                  step === s ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md" :
                               "bg-gray-100 text-gray-400"
                }`}>
                  {step > s ? <CheckCircle size={14} /> : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-8 rounded-full transition-all ${step > s ? "bg-emerald-400" : "bg-gray-200"}`} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-gray-400 font-medium">
              {step === 1 ? "Enter Email" : step === 2 ? "Verify OTP" : "Create Account"}
            </span>
          </div>

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-1">Create account</h2>
              <p className="text-sm text-gray-500 mb-7">
                Enter your email to get started. We'll send you a verification code.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide text-gray-500">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-sm"
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><span>Send Verification Code</span><ArrowRight size={16} /></>
                  }
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-amber-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-1">Verify your email</h2>
              <p className="text-sm text-gray-500 mb-1">
                We sent a 6-digit code to
              </p>
              <p className="text-sm font-semibold text-amber-600 mb-7">{email}</p>

              {/* OTP fallback banner — shown when email delivery failed */}
              {demoOtp && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-black">!</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-800">Email delivery failed — use this OTP</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Your OTP is: <span className="font-black text-amber-900 text-base tracking-widest">{demoOtp}</span>
                    </p>
                    <p className="text-[10px] text-amber-600 mt-0.5">It has been auto-filled in the boxes below.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                {/* OTP boxes */}
                <div>
                  <label className="text-xs font-semibold block mb-3 uppercase tracking-wide text-gray-500">
                    Enter OTP
                  </label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => otpRefs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className={`w-12 h-14 text-center text-xl font-black border-2 rounded-xl transition-all focus:outline-none ${
                          digit
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-200 bg-gray-50 text-gray-800 focus:border-amber-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < OTP_LENGTH}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-sm"
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><ShieldCheck size={16} /><span>Verify OTP</span></>
                  }
                </button>
              </form>

              {/* Resend */}
              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={() => { setStep(1); setOtp(Array(OTP_LENGTH).fill("")); setError(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Change email
                </button>
                <button
                  onClick={handleResend}
                  disabled={resendSecs > 0 || loading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                  {resendSecs > 0 ? `Resend in ${resendSecs}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Details ── */}
          {step === 3 && (
            <>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-1">Almost there!</h2>
              <p className="text-sm text-gray-500 mb-7">
                Fill in your details to complete registration.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide text-gray-500">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rahul Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide text-gray-500">
                    Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide text-gray-500">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {pwStrength && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${pwStrength.color} ${pwStrength.w}`} />
                      </div>
                      <p className={`text-[10px] mt-1 font-semibold ${
                        pwStrength.label === "Weak"   ? "text-red-500" :
                        pwStrength.label === "Fair"   ? "text-amber-500" :
                        pwStrength.label === "Good"   ? "text-blue-500" : "text-emerald-500"
                      }`}>{pwStrength.label} password</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide text-gray-500">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showCPw ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      required
                      className={`w-full pl-10 pr-11 py-3 border rounded-xl text-sm bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all ${
                        confirmPw && password !== confirmPw
                          ? "border-red-400 focus:border-red-400"
                          : confirmPw && password === confirmPw
                          ? "border-emerald-400 focus:border-emerald-400"
                          : "border-gray-200 focus:border-amber-500"
                      }`}
                    />
                    <button type="button" onClick={() => setShowCPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    {confirmPw && password === confirmPw && (
                      <CheckCircle size={15} className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  {confirmPw && password !== confirmPw && (
                    <p className="text-[10px] text-red-500 mt-1 font-medium">Passwords do not match</p>
                  )}
                </div>

                {/* Email display (read-only) */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Mail size={14} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-amber-600 font-semibold">Verified Email</p>
                    <p className="text-xs text-gray-700 font-medium">{email}</p>
                  </div>
                  <CheckCircle size={14} className="text-emerald-500 ml-auto flex-shrink-0" />
                </div>

                <button
                  type="submit"
                  disabled={loading || !name.trim() || password.length < 6 || password !== confirmPw}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-sm mt-2"
                >
                  {loading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><span>Create My Account</span><ArrowRight size={16} /></>
                  }
                </button>

                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  By creating an account you agree to our{" "}
                  <span className="text-amber-600 cursor-pointer hover:underline">Terms of Service</span>
                  {" "}and{" "}
                  <span className="text-amber-600 cursor-pointer hover:underline">Privacy Policy</span>.
                </p>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{" "}
                <Link href="/login" className="text-amber-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
