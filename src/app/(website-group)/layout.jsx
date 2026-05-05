"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Dumbbell, Menu, X, MapPin, Phone, Mail,
  ChevronDown, ChevronRight, LogOut, User, Settings,
  Award, CreditCard, Video, Bell,
} from "lucide-react";
import { notificationAPI, liveClassAPI } from "@/lib/api";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const NAV_ITEMS = [
  { label: "Home",       href: "/" },
  { label: "Classes",    href: "/classes" },
  { label: "Trainers",   href: "/trainers" },
  { label: "Membership", href: "/membership" },
  { label: "Contact",    href: "/contact" },
];

export default function WebsiteLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logoutUser, loaded } = useAuth();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [zoomOpen,    setZoomOpen]    = useState(false);
  // Mobile-specific panel states
  const [mobileZoomOpen,  setMobileZoomOpen]  = useState(false);
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const profileRef = useRef(null);
  const notifRef   = useRef(null);
  const zoomRef    = useRef(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); setNotifOpen(false); setZoomOpen(false); setMobileZoomOpen(false); setMobileNotifOpen(false); }, [pathname]);

  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (zoomRef.current    && !zoomRef.current.contains(e.target))    setZoomOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Fetch notifications when user is logged in ─────────────────
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await notificationAPI.getAll({ limit: 8 });
        setNotifs(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      } catch { /* silent */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // ── Fetch upcoming live classes ────────────────────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await liveClassAPI.getUpcoming({ limit: 5 });
        setUpcomingClasses(res.data || []);
      } catch { /* silent */ }
    };
    fetchClasses();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifs(p => p.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const fmtTime = (d) => {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    if (mins < 1)  return "now";
    if (mins < 60) return `${mins}m`;
    if (hrs < 24)  return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const fmtClassDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

  const handleLogout = () => {
    logoutUser();
    setProfileOpen(false);
    router.push("/login");
  };

  const isActive = (href) => mounted && (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  // Helper function to get gym name safely
  const getGymName = () => {
    if (!user?.gym) return null;
    if (typeof user.gym === 'string') return user.gym;
    if (typeof user.gym === 'object' && user.gym.name) return user.gym.name;
    return null;
  };

  const gymName = getGymName();

  return (
    <div className="bg-white min-h-screen flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? "bg-white shadow-xl py-2" : "bg-white/95 backdrop-blur-md py-4"}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <Dumbbell className="text-amber-500 w-8 h-8 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-bold text-gray-800 group-hover:scale-105 transition-transform duration-300">
              Fit<span className="text-amber-500 relative">Zone
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300" />
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-8">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}
                className={`relative font-medium transition-colors group ${isActive(item.href) ? "text-amber-500" : "text-gray-600 hover:text-amber-500"}`}>
                {item.label}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex gap-3 items-center">
            {/* ── Zoom Live Classes icon ── */}
            <div className="relative" ref={zoomRef}>
              <button
                onClick={() => { setZoomOpen(v => !v); setNotifOpen(false); setProfileOpen(false); }}
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all cursor-pointer"
                title="Live Classes"
              >
                <Video size={18} className="text-gray-600" />
                {upcomingClasses.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>

              {zoomOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <p className="text-sm font-bold text-white flex items-center gap-2"><Video size={15} /> Live Classes</p>
                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">{upcomingClasses.length} upcoming</span>
                  </div>
                  {upcomingClasses.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <Video size={24} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-medium">No upcoming live classes</p>
                      <p className="text-[10px] text-gray-300 mt-1">Check back soon!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                      {upcomingClasses.map(lc => {
                        const isLive = lc.status === "live";
                        const hasJoinUrl = !!(lc.zoomJoinUrl);
                        return (
                          <div key={lc._id} className={`px-4 py-3 transition-colors ${isLive ? "bg-red-50/50 hover:bg-red-50" : "hover:bg-blue-50"}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{lc.title}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">{lc.category} · {lc.duration} min</p>
                                <p className="text-[10px] text-blue-600 font-semibold mt-0.5">📅 {fmtClassDate(lc.scheduledAt)}</p>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  isLive ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-100 text-blue-600"
                                }`}>
                                  {isLive ? "🔴 LIVE" : "Scheduled"}
                                </span>
                                <p className="text-[10px] text-gray-500 mt-1">{lc.isFree ? "Free" : `₹${lc.price}`}</p>
                              </div>
                            </div>
                            {/* Join button — show for live classes with URL, or all classes */}
                            <div className="mt-2 flex gap-2">
                              {isLive && hasJoinUrl ? (
                                <a
                                  href={lc.zoomJoinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setZoomOpen(false)}
                                  className="flex-1 text-center py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Video size={11} /> Join Now →
                                </a>
                              ) : isLive && !hasJoinUrl ? (
                                <span className="flex-1 text-center py-1.5 bg-gray-100 text-gray-400 text-xs rounded-lg">
                                  Link not available
                                </span>
                              ) : hasJoinUrl ? (
                                <a
                                  href={lc.zoomJoinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setZoomOpen(false)}
                                  className="flex-1 text-center py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Video size={11} /> Open Zoom
                                </a>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">Powered by Zoom</p>
                    <Link href="/classes" onClick={() => setZoomOpen(false)} className="text-[10px] text-blue-500 font-semibold hover:underline">
                      View all →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Notifications icon ── */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(v => !v); setZoomOpen(false); setProfileOpen(false); }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={18} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                      )}
                    </div>
                    {notifs.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-400">No notifications yet</div>
                    ) : (
                      <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                        {notifs.map(n => (
                          <div key={n._id} onClick={() => handleMarkRead(n._id)}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-amber-50 cursor-pointer transition-colors ${!n.read ? "bg-amber-50/50" : ""}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              n.type === "payment" ? "bg-emerald-500" :
                              n.type === "class"   ? "bg-blue-500" :
                              n.type === "alert"   ? "bg-red-500" :
                              n.type === "member"  ? "bg-violet-500" : "bg-gray-400"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs text-gray-800 ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                              <p className="text-[10px] text-gray-500 truncate mt-0.5">{n.message}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{fmtTime(n.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="px-4 py-2.5 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 text-center">Click a notification to mark as read</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {mounted && loaded && user ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-all duration-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-black shadow-sm">{initials}</div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800 leading-tight">{user.name?.split(" ")[0]}</p>
                    <p className="text-[9px] text-amber-600 font-semibold leading-tight">{user.plan || "Member"}</p>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden z-50">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-white text-base font-black shadow-md">{initials}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-amber-100 truncate">{user.email || "user@fitzone.in"}</p>
                          <span className="inline-block mt-0.5 text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{user.plan || "Member"} Plan</span>
                        </div>
                      </div>
                    </div>
                    {gymName && (
                      <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                        <p className="text-[10px] text-amber-600 font-semibold">📍 {gymName}</p>
                        {user.planExpiry && <p className="text-[10px] text-gray-500 mt-0.5">Expires: {user.planExpiry}</p>}
                      </div>
                    )}
                    <div className="py-1.5">
                      {[
                        { icon: User,       label: "My Profile",      href: "/" },
                        { icon: Award,      label: "My Achievements", href: "/" },
                        { icon: CreditCard, label: "Membership",      href: "/membership" },
                        { icon: Settings,   label: "Settings",        href: "/" },
                      ].map((item, i) => (
                        <Link key={i} href={item.href} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                          <item.icon size={15} className="text-amber-400" />{item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 py-1.5">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="border-2 border-amber-500 text-amber-600 px-5 py-2 rounded-full text-sm font-semibold hover:bg-amber-500 hover:text-white transition-all duration-300 hover:scale-105">Login</Link>
                <Link href="/signup" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Zoom icon */}
            <button
              onClick={() => { setMobileZoomOpen(v => !v); setMobileNotifOpen(false); setMobileOpen(false); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-amber-50 transition-all"
              title="Live Classes"
            >
              <Video size={18} className="text-gray-600" />
              {upcomingClasses.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </button>

            {/* Mobile Notifications icon — only when logged in */}
            {mounted && loaded && user && (
              <button
                onClick={() => { setMobileNotifOpen(v => !v); setMobileZoomOpen(false); setMobileOpen(false); }}
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-amber-50 transition-all"
                title="Notifications"
              >
                <Bell size={18} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Hamburger */}
            <button onClick={() => { setMobileOpen(v => !v); setMobileZoomOpen(false); setMobileNotifOpen(false); }}>
              {mobileOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Zoom dropdown ── */}
        {mobileZoomOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
              <p className="text-sm font-bold text-white flex items-center gap-2"><Video size={15} /> Live Classes</p>
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">{upcomingClasses.length} upcoming</span>
            </div>
            {upcomingClasses.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Video size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">No upcoming live classes</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {upcomingClasses.map(lc => {
                  const isLive = lc.status === "live";
                  const hasJoinUrl = !!(lc.zoomJoinUrl);
                  return (
                    <div key={lc._id} className={`px-4 py-3 transition-colors ${isLive ? "bg-red-50/50" : "hover:bg-blue-50"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{lc.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{lc.category} · {lc.duration} min</p>
                          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">📅 {fmtClassDate(lc.scheduledAt)}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isLive ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-100 text-blue-600"
                          }`}>
                            {isLive ? "🔴 LIVE" : "Scheduled"}
                          </span>
                          <p className="text-[10px] text-gray-500 mt-1">{lc.isFree ? "Free" : `₹${lc.price}`}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        {isLive && hasJoinUrl ? (
                          <a
                            href={lc.zoomJoinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileZoomOpen(false)}
                            className="block w-full text-center py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                          >
                            🔴 Join Now →
                          </a>
                        ) : hasJoinUrl ? (
                          <a
                            href={lc.zoomJoinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileZoomOpen(false)}
                            className="block w-full text-center py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Open Zoom Link
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-[10px] text-gray-400">Powered by Zoom</p>
              <Link href="/classes" onClick={() => setMobileZoomOpen(false)} className="text-[10px] text-blue-500 font-semibold hover:underline">
                View all →
              </Link>
            </div>
          </div>
        )}

        {/* ── Mobile Notifications dropdown ── */}
        {mobileNotifOpen && user && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><Bell size={15} /> Notifications</p>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </div>
            {notifs.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-400">No notifications yet</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {notifs.map(n => (
                  <div key={n._id} onClick={() => handleMarkRead(n._id)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-amber-50 cursor-pointer transition-colors ${!n.read ? "bg-amber-50/50" : ""}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      n.type === "payment" ? "bg-emerald-500" :
                      n.type === "class"   ? "bg-blue-500" :
                      n.type === "alert"   ? "bg-red-500" :
                      n.type === "member"  ? "bg-violet-500" : "bg-gray-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs text-gray-800 ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{fmtTime(n.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400 text-center">Tap a notification to mark as read</p>
            </div>
          </div>
        )}

        {/* ── Mobile nav menu ── */}
        {mobileOpen && (
          <div className="md:hidden bg-white shadow-xl py-4 px-4 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}
                className={`py-2.5 px-3 rounded-lg font-medium transition-colors ${isActive(item.href) ? "text-amber-500 bg-amber-50" : "text-gray-600 hover:text-amber-500 hover:bg-amber-50"}`}>
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 mt-1">
              {mounted && loaded && user ? (
                <div>
                  <div className="flex items-center gap-3 bg-amber-50 rounded-xl px-3 py-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-black shadow-sm flex-shrink-0">{initials}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-amber-600 font-semibold">{user.plan || "Member"} Plan</p>
                      {gymName && <p className="text-[10px] text-gray-500 truncate">📍 {gymName}</p>}
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="border-2 border-amber-500 text-amber-600 px-6 py-2.5 rounded-full text-sm font-semibold text-center hover:bg-amber-500 hover:text-white transition-colors">Login</Link>
                  <Link href="/signup" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold text-center">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main className="flex-1">{children}</main>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 pt-8 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="text-amber-500 w-6 h-6" />
                <span className="text-lg font-bold text-white">Fit<span className="text-amber-500">Zone</span></span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">Your trusted partner in fitness since 2014. 10+ years of transforming lives.</p>
              <div className="flex gap-2">
                {[FaFacebook, FaInstagram, FaTwitter, FaYoutube].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-amber-500 transition-all duration-300 hover:scale-110">
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}><Link href={item.href} className="text-gray-400 hover:text-amber-500 transition-colors text-xs">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Contact Info</h4>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-gray-400"><MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" /><span className="text-xs">123 Fitness Ave, Andheri West, Mumbai – 400058</span></li>
                <li className="flex items-center gap-2 text-gray-400"><Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /><span className="text-xs">+91 98765 43210</span></li>
                <li className="flex items-center gap-2 text-gray-400"><Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /><span className="text-xs">hello@fitzone.in</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-3">Opening Hours</h4>
              <ul className="space-y-2 text-gray-400 text-xs">
                <li><span className="font-medium text-gray-300">Monday – Friday:</span> 5:30 AM – 11:00 PM</li>
                <li><span className="font-medium text-gray-300">Saturday:</span> 6:00 AM – 10:00 PM</li>
                <li><span className="font-medium text-gray-300">Sunday:</span> 7:00 AM – 9:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 text-center">
            <p className="text-gray-500 text-xs">© {new Date().getFullYear()} FitZone. 10+ Years of Fitness Excellence. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}