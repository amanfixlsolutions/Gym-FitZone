"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/lib/api";
import { Dumbbell, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle, RefreshCw } from "lucide-react";

const STEPS = { EMAIL: 1, OTP: 2, DETAILS: 3 };

export default function SignupPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [step,         setStep]         = useState(STEPS.EMAIL);
  const [email,        setEmail]        = useState("");
  const [otp,          setOtp]          = useState("");
  const [verifyToken,  setVerifyToken]  = useState("");
  const [name,         setName]         = useState("");
  const [phone,        setPhone]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [otpSent,      setOtpSent]      = useState(false);
  const [countdown,    setCountdown]    = useState(0);

  // ── Step 1: Send OTP ───────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await authAPI.sendOTP(email, "signup");
      setOtpSent(true);
      setStep(STEPS.OTP);
      startCountdown();
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await authAPI.verifyOTP(email, otp, "signup");
      setVerifyToken(data.verifyToken);
      setStep(STEPS.DETAILS);
    } catch (err) {
      setError(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Complete Registration ──────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await authAPI.register({ name, email, password, phone, verifyToken, role: "member" });
      // Auto-login after registration
      await loginUser(email, password);
      router.push("/");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setError(""); setLoading(true);
    try {
      await authAPI.sendOTP(email, "signup");
      startCountdown();
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Dumbbell size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl text-[var(--text)]">FitZone</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--text)]">Create Account</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Join FitZone and start your fitness journey</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-amber-500 text-white" : "bg-[var(--surface2)] text-[var(--muted)]"}`}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-amber-500" : "bg-[var(--border)]"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* ── STEP 1: Email ── */}
          {step === STEPS.EMAIL && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)] mb-1">Enter your email</h2>
                <p className="text-sm text-[var(--muted)] mb-4">We'll send a verification code to confirm your email.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all text-sm">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)] mb-1">Verify your email</h2>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Enter the 6-digit OTP sent to <strong className="text-[var(--text)]">{email}</strong>
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5 uppercase tracking-wide">OTP Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] text-center text-2xl font-bold tracking-[0.5em] placeholder:text-[var(--muted2)] placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all text-sm">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Verify OTP</span><ArrowRight size={16} /></>}
              </button>
              <div className="text-center">
                <button type="button" onClick={handleResend} disabled={countdown > 0 || loading}
                  className="text-sm text-amber-600 hover:text-amber-700 disabled:text-[var(--muted)] disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto">
                  <RefreshCw size={13} />
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Details ── */}
          {step === STEPS.DETAILS && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--text)] mb-1">Complete your profile</h2>
                <p className="text-sm text-[var(--muted)] mb-4">Fill in your details to finish registration.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                  <input type="text" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5 uppercase tracking-wide">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                  <input type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                  <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                    className="w-full pl-10 pr-11 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)] hover:text-[var(--muted)]">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all text-sm">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-600 font-semibold hover:text-amber-700">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
