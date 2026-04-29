"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";

export default function UserLoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    loginUser({ name: "Rahul Sharma", email: form.email, role: "user", avatar: "RS", plan: "Quarterly", gym: "Iron Paradise Fitness", planExpiry: "Apr 15, 2025" });
    router.push("/user");
  };

  const handleGoogle = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    loginUser({ name: "Rahul Sharma", email: "rahul@gmail.com", role: "user", avatar: "RS", plan: "Quarterly", gym: "Iron Paradise Fitness", planExpiry: "Apr 15, 2025" });
    router.push("/user");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Dumbbell size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-white">FitZone</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Your fitness<br />journey starts<br />here.
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed mb-8">
            Discover gyms near you, book classes, track workouts and connect with a community of fitness enthusiasts.
          </p>
          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["🏋️ 6,000+ Gyms", "📅 Real-time Booking", "🤖 AI Workout Plans", "🏆 Challenges"].map((f) => (
              <span key={f} className="bg-white/15 text-white text-sm px-3 py-1.5 rounded-full font-medium">{f}</span>
            ))}
          </div>
        </div>

        <p className="text-emerald-200 text-sm relative z-10">© 2025 FitZone. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-[var(--text)]">FitZone</span>
          </div>

          <h2 className="text-3xl font-black text-[var(--text)] mb-1">Welcome back</h2>
          <p className="text-[var(--muted)] mb-8">Sign in to your member account</p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border-2 border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--text)] font-semibold py-3 rounded-xl transition-all mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted2)]">or sign in with email</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[var(--text)]">Password</label>
                <Link href="/user/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)] hover:text-[var(--muted)]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--muted)] mt-6">
            Don't have an account?{" "}
            <Link href="/user/register" className="text-emerald-600 font-semibold hover:text-emerald-700">Create one free</Link>
          </p>

          {/* OTP option */}
          <p className="text-center text-sm text-[var(--muted)] mt-2">
            Prefer OTP?{" "}
            <Link href="/user/verify" className="text-emerald-600 font-semibold hover:text-emerald-700">Login with phone</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
