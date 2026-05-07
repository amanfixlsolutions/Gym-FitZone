"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Dumbbell, Eye, EyeOff, Lock, Mail, ArrowRight,
  Zap, ShieldCheck, Building2, Users, UserPlus,
} from "lucide-react";
import Link from "next/link";

const ROLE_REDIRECT = {
  "super-admin": "/super-admin",
  "gym-owner":   "/gym-owner",
  "member":      "/",
};

const DEMO_CARDS = [
  { role: "super-admin", email: "superadmin@fitzone.in", password: "super@123", label: "Super Admin", grad: "from-violet-600 to-purple-700", badge: "Platform Owner", badgeCls: "bg-violet-100 text-violet-700", icon: ShieldCheck },
  { role: "gym-owner",   email: "admin@ironparadise.in", password: "admin@123", label: "Gym Admin",   grad: "from-blue-600 to-blue-700",     badge: "Gym Admin",      badgeCls: "bg-blue-100 text-blue-700",     icon: Building2 },
  { role: "member",      email: "user@fitzone.in",       password: "user@123",  label: "Member",      grad: "from-emerald-600 to-teal-700",  badge: "Gym Member",     badgeCls: "bg-emerald-100 text-emerald-700", icon: Users },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPass,     setShowPass]     = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [quickLoading, setQuickLoading] = useState(null);

  const doLogin = async (em, pw) => {
    const user = await loginUser(em, pw);
    router.push(ROLE_REDIRECT[user.role] || "/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await doLogin(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (card) => {
    setQuickLoading(card.role); setError("");
    try {
      await doLogin(card.email, card.password);
    } catch (err) {
      setError(err.message || "Login failed.");
      setQuickLoading(null);
    }
  };

  return (
    // Force light mode — login page is always white regardless of system/user theme
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#ffffff", colorScheme: "light" }}>
      <style>{`
        .login-page, .login-page * {
          --bg: #f5f7fa !important;
          --surface: #ffffff !important;
          --surface2: #f9fafb !important;
          --border: #e5e7eb !important;
          --text: #111827 !important;
          --muted: #6b7280 !important;
          --muted2: #9ca3af !important;
        }
      `}</style>

      {/* ── LEFT PANEL (gradient — always dark) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-700 via-blue-600 to-violet-700 flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <Dumbbell size={22} className="text-white" />
          </div>
          <div>
            <p className="font-black text-xl text-white tracking-tight">FitZone</p>
            <p className="text-blue-200 text-xs">Gym Management Platform</p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap size={12} /> All-in-one gym platform
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Manage your<br />fitness empire<br />from one place.
          </h1>
          <p className="text-blue-100 text-base leading-relaxed mb-8">
            Super admins, gym owners and members — all connected in a single powerful platform.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: "6,225+",  l: "Active Gyms" },
              { v: "16,431+", l: "Members" },
              { v: "₹2.83Cr", l: "Monthly GMV" },
              { v: "4.8★",    l: "Avg Rating" },
            ].map(s => (
              <div key={s.l} className="bg-white/10 rounded-xl p-3">
                <p className="text-xl font-black text-white">{s.v}</p>
                <p className="text-xs text-blue-200 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs relative z-10">© 2025 FitZone. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANEL — hardcoded white, never dark ── */}
      <div className="login-page flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12 overflow-y-auto"
        style={{ background: "#ffffff" }}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-black text-xl" style={{ color: "#111827" }}>FitZone</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mb-1" style={{ color: "#111827" }}>
            Welcome back
          </h2>
          <p className="mb-7 text-sm" style={{ color: "#6b7280" }}>
            Sign in to your account to continue
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: "#6b7280" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111827" }}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: "#6b7280" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ background: "#f9fafb", borderColor: "#e5e7eb", color: "#111827" }}
                  className="w-full pl-10 pr-11 py-3 border rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#9ca3af" }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-sm"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Sign up link */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: "#6b7280" }}>
              New member?{" "}
              <Link
                href="/signup"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Create account
              </Link>
            </p>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
            >
              <UserPlus size={13} /> Sign Up Free
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "#e5e7eb" }} />
            <span className="text-xs font-medium whitespace-nowrap" style={{ color: "#9ca3af" }}>
              or quick login with demo account
            </span>
            <div className="flex-1 h-px" style={{ background: "#e5e7eb" }} />
          </div>

          {/* Quick login cards */}
          <div className="space-y-3">
            {DEMO_CARDS.map((card) => (
              <button
                key={card.role}
                onClick={() => handleQuickLogin(card)}
                disabled={quickLoading !== null}
                style={{ background: "#ffffff", borderColor: "#f3f4f6" }}
                className="w-full flex items-center gap-4 p-4 border-2 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all duration-200 group disabled:opacity-60 text-left"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.grad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  {quickLoading === card.role
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <card.icon size={20} className="text-white" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm" style={{ color: "#111827" }}>{card.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeCls}`}>
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "#6b7280" }}>{card.email}</p>
                  <p className="text-[10px] mt-0.5 font-mono" style={{ color: "#9ca3af" }}>
                    Password: {card.password}
                  </p>
                </div>
                <ArrowRight size={16} className="group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" style={{ color: "#d1d5db" }} />
              </button>
            ))}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#9ca3af" }}>
            FitZone Platform · v1.0.0 ·{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
