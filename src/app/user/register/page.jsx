"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Check } from "lucide-react";

const goals = ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "General Fitness", "Sports Training"];

export default function UserRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = account, 2 = profile
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    age: "", gender: "", goal: "", height: "", weight: "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleStep1 = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/user/verify");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] bg-gradient-to-br from-emerald-600 to-teal-800 flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Dumbbell size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-white">FitZone</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-4">Join 16,000+<br />members today</h2>
          <div className="space-y-3">
            {["Find gyms near you instantly", "Book classes in real-time", "Track your fitness progress", "AI-powered workout plans", "Connect with gym community"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-emerald-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-emerald-200 text-sm relative z-10">Free to join. No credit card required.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-[var(--text)]">FitZone</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "bg-emerald-600 text-white" : "bg-[var(--surface2)] text-[var(--muted)] border border-[var(--border)]"}`}>
                  {step > s ? <Check size={14} /> : s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>
                  {s === 1 ? "Account" : "Profile"}
                </span>
                {s < 2 && <div className={`w-12 h-0.5 ${step > s ? "bg-emerald-600" : "bg-[var(--border)]"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <h2 className="text-2xl font-black text-[var(--text)] mb-1">Create your account</h2>
              <p className="text-[var(--muted)] mb-6">Start your fitness journey for free</p>
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                    <input required type="text" placeholder="Rahul Sharma" value={form.name} onChange={(e) => set("name", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                    <input required type="email" placeholder="rahul@example.com" value={form.email} onChange={(e) => set("email", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                    <input required type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
                    <input required type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)}
                      className="w-full pl-10 pr-11 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted2)]">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm">
                  Continue <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-black text-[var(--text)] mb-1">Complete your profile</h2>
              <p className="text-[var(--muted)] mb-6">Help us personalise your experience</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Age</label>
                    <input type="number" placeholder="25" value={form.age} onChange={(e) => set("age", e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Gender</label>
                    <select value={form.gender} onChange={(e) => set("gender", e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Height (cm)</label>
                    <input type="number" placeholder="175" value={form.height} onChange={(e) => set("height", e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Weight (kg)</label>
                    <input type="number" placeholder="70" value={form.weight} onChange={(e) => set("weight", e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted2)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--text)] block mb-2">Fitness Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {goals.map((g) => (
                      <button key={g} type="button" onClick={() => set("goal", g)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.goal === g ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-[var(--border)] text-[var(--muted)] hover:border-emerald-300"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-[var(--border)] text-[var(--text)] font-semibold rounded-xl hover:bg-[var(--surface2)] transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all">
                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-sm text-[var(--muted)] mt-6">
            Already have an account?{" "}
            <Link href="/user/login" className="text-emerald-600 font-semibold hover:text-emerald-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
