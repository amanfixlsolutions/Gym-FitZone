"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Bell, Sun, Moon, ChevronDown, Calendar, Download, LogOut, User, Shield, Settings } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

const notifications = [
  { title: "New gym registered", desc: "FitLife Studio – Delhi", time: "2m ago", dot: "bg-blue-500" },
  { title: "Payment received", desc: "Rahul Sharma – ₹2,999", time: "15m ago", dot: "bg-emerald-500" },
  { title: "Review flagged", desc: "Inappropriate content", time: "1h ago", dot: "bg-amber-500" },
  { title: "Payment failed", desc: "Priya Mehta – ₹1,499", time: "3h ago", dot: "bg-red-500" },
];

export default function Topbar({ title = "Dashboard" }) {
  const { dark, toggle } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-[60px] bg-[var(--surface)] border-b border-[var(--border)] flex items-center px-5 gap-3 sticky top-0 z-20 shadow-sm">
      {/* Page title */}
      <h2 className="text-base font-bold text-[var(--text)] whitespace-nowrap mr-2">{title}</h2>

      {/* Search */}
      <div className="flex-1 max-w-xs relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-8 pr-10 py-1.5 text-sm bg-[var(--surface2)] border border-[var(--border)] rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
            text-[var(--text)] placeholder:text-[var(--muted2)] transition-all"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted2)] bg-[var(--border)] px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </span>
      </div>

      <div className="flex-1" />

      {/* Date range */}
      <button className="hidden md:flex items-center gap-2 text-sm text-[var(--muted)] bg-[var(--surface2)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:border-blue-400 transition-colors">
        <Calendar size={13} className="text-[var(--muted2)]" />
        <span className="text-xs">Jan 1 – Feb 1, 2025</span>
      </button>

      {/* Period selector */}
      <button className="hidden md:flex items-center gap-1 text-xs text-[var(--muted)] bg-[var(--surface2)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:border-blue-400 transition-colors">
        Last 30 days <ChevronDown size={12} />
      </button>

      {/* Export */}
      <button className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
        <Download size={13} /> Export
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={toggle}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--surface2)] transition-colors"
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark
          ? <Sun size={17} className="text-amber-400" />
          : <Moon size={17} className="text-[var(--muted)]" />
        }
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setShowNotif((v) => !v); setShowProfile(false); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--surface2)] transition-colors relative"
        >
          <Bell size={17} className="text-[var(--muted)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--surface)]" />
        </button>

        {showNotif && (
          <div className="absolute right-0 top-12 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <p className="text-sm font-semibold text-[var(--text)]">Notifications</p>
              <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
                4 new
              </span>
            </div>
            <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface2)] cursor-pointer transition-colors">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] leading-tight">{n.title}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{n.desc}</p>
                  </div>
                  <span className="text-[10px] text-[var(--muted2)] whitespace-nowrap">{n.time}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-[var(--border)]">
              <Link href="/notifications" className="text-xs text-blue-600 font-medium hover:text-blue-700">
                View all notifications →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Profile dropdown */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => { setShowProfile((v) => !v); setShowNotif(false); }}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[var(--surface2)] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            SA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-[var(--text)] leading-tight">Super Admin</p>
            <p className="text-[10px] text-[var(--muted)]">admin@fitzone.in</p>
          </div>
          <ChevronDown size={13} className="text-[var(--muted2)] hidden md:block" />
        </button>

        {showProfile && (
          <div className="absolute right-0 top-12 w-52 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <p className="text-sm font-semibold text-[var(--text)]">Super Admin</p>
              <p className="text-xs text-[var(--muted)]">admin@fitzone.in</p>
            </div>
            <div className="py-1">
              {[
                { icon: User, label: "My Profile", href: "/profile" },
                { icon: Shield, label: "Security", href: "/settings" },
                { icon: Settings, label: "Settings", href: "/settings" },
              ].map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-colors"
                >
                  <Icon size={14} />
                  {label}
                </Link>
              ))}
            </div>
            <div className="border-t border-[var(--border)] py-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


