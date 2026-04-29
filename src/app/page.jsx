"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Dumbbell, Eye, EyeOff, Lock, Mail, ArrowRight, Zap, ShieldCheck, Building2, Users } from "lucide-react";

// ── Dummy credentials ──────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  {
    role: "super-admin",
    email: "superadmin@fitzone.in",
    password: "super@123",
    name: "Rajiv Sharma",
    avatar: "RS",
    label: "Super Admin",
    grad: "from-violet-600 to-purple-700",
    badge: "Platform Owner",
    badgeCls: "bg-violet-100 text-violet-700",
    icon: ShieldCheck,
    redirect: "/super-admin",
  },
  {
    role: "gym-owner",
    email: "admin@ironparadise.in",
    password: "admin@123",
    name: "Suresh Nair",
    avatar: "SN",
    label: "Gym Admin",
    gymName: "Iron Paradise Fitness",
    grad: "from-blue-600 to-blue-700",
    badge: "Gym Admin",
    badgeCls: "bg-blue-100 text-blue-700",
    icon: Building2,
    redirect: "/gym-owner",
  },
  {
    role: "user",
    email: "user@fitzone.in",
    password: "user@123",
    name: "Rahul Sharma",
    avatar: "RS",
    label: "Member",
    plan: "Quarterly",
    gym: "Iron Paradise Fitness",
    planExpiry: "Apr 15, 2025",
    grad: "from-emerald-600 to-teal-700",
    badge: "Gym Member",
    badgeCls: "bg-emerald-100 text-emerald-700",
    icon: Users,
    redirect: "/user",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(null);

  // ── Email + password login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email.trim().toLowerCase() && a.password === password
    );
    if (!account) {
      setError("Invalid email or password. Try the demo credentials below.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    loginUser(account);
    router.push(account.redirect);
  };

  // ── One-click quick login ──
  const handleQuickLogin = async (account) => {
    setQuickLoading(account.role);
    await new Promise((r) => setTimeout(r, 500));
    loginUser(account);
    router.push(account.redirect);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col lg:flex-row">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-700 via-blue-600 to-violet-700 flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <Dumbbell size={22} className="text-white" />
          </div>
          <div>
            <p className="font-black text-xl text-white tracking-tight">FitZone</p>
            <p className="text-blue-200 text-xs">Gym Management Platform</p>
          </div>
        </div>

        {/* Content */}
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
              { v: "6,225+", l: "Active Gyms" },
              { v: "16,431+", l: "Members" },
              { v: "₹2.83Cr", l: "Monthly GMV" },
              { v: "4.8★", l: "Avg Rating" },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 rounded-xl p-3">
                <p className="text-xl font-black text-white">{s.v}</p>
                <p className="text-xs text-blue-200 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs relative z-10">© 2025 FitZone. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-black text-xl text-[var(--text)]">FitZone</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text)] mb-1">Welcome back</h2>
          <p className="text-[var(--muted)] mb-7 text-sm">Sign in to your account to continue</p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)] hover:text-[var(--muted)] transition-colors"
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

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted2)] font-medium">or quick login with demo account</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Quick login cards */}
          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                onClick={() => handleQuickLogin(account)}
                disabled={quickLoading !== null}
                className="w-full flex items-center gap-4 p-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl hover:border-blue-400 hover:shadow-md transition-all duration-200 group disabled:opacity-60 text-left"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${account.grad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  {quickLoading === account.role
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <account.icon size={20} className="text-white" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-[var(--text)] text-sm">{account.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${account.badgeCls}`}>
                      {account.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] truncate">{account.email}</p>
                  <p className="text-[10px] text-[var(--muted2)] mt-0.5 font-mono">Password: {account.password}</p>
                </div>

                {/* Arrow */}
                <ArrowRight size={16} className="text-[var(--muted2)] group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--muted2)] mt-6">
            FitZone Platform · Demo Mode · All data is simulated
          </p>
        </div>
      </div>
    </div>
  );
}
