"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Dumbbell, Menu, X, MapPin, Phone, Mail, ChevronDown, LogOut, User, Settings, Award, CreditCard } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const NAV_ITEMS = [
  { label: "Home",       href: "/user" },
  { label: "Classes",    href: "/user/classes" },
  { label: "Trainers",   href: "/user/trainers" },
  { label: "Membership", href: "/user/membership" },
  { label: "Contact",    href: "/user/contact" },
];

const EXCLUDED = ["/user/login", "/user/register", "/user/verify"];

export default function UserLayout({ children }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logoutUser, loaded } = useAuth();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const fn = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setProfileOpen(false);
    router.push("/");
  };

  // Skip shared layout for auth pages
  if (EXCLUDED.some(p => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  const isActive = (href) => mounted && (href === "/user" ? pathname === "/user" : pathname.startsWith(href));

  // User initials for avatar
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <div className="bg-white min-h-screen flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? "bg-white shadow-xl py-2" : "bg-white/95 backdrop-blur-md py-4"}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">

          {/* Logo */}
          <Link href="/user" className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              <Dumbbell className="text-amber-500 w-8 h-8 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-bold text-gray-800 group-hover:scale-105 transition-transform duration-300">
              Fit<span className="text-amber-500 relative">
                Zone
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300" />
              </span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-8">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}
                className={`relative font-medium transition-colors group ${isActive(item.href) ? "text-amber-500" : "text-gray-600 hover:text-amber-500"}`}>
                {item.label}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </div>

          {/* Right side — auth */}
          <div className="hidden md:flex gap-3 items-center">
            {mounted && loaded && user ? (
              /* ── LOGGED IN: profile dropdown ── */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
                    {initials}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800 leading-tight">{user.name?.split(" ")[0]}</p>
                    <p className="text-[9px] text-amber-600 font-semibold leading-tight">{user.plan || "Member"}</p>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden z-50">
                    {/* User info header */}
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-white text-base font-black shadow-md">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-amber-100 truncate">{user.email || "user@fitzone.in"}</p>
                          <span className="inline-block mt-0.5 text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                            {user.plan || "Member"} Plan
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Membership info */}
                    {user.gym && (
                      <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                        <p className="text-[10px] text-amber-600 font-semibold">📍 {user.gym}</p>
                        {user.planExpiry && (
                          <p className="text-[10px] text-gray-500 mt-0.5">Expires: {user.planExpiry}</p>
                        )}
                      </div>
                    )}

                    {/* Menu items */}
                    <div className="py-1.5">
                      {[
                        { icon: User,     label: "My Profile",       href: "/user" },
                        { icon: Award,    label: "My Achievements",  href: "/user" },
                        { icon: CreditCard, label: "Membership",     href: "/user/membership" },
                        { icon: Settings, label: "Settings",         href: "/user" },
                      ].map((item, i) => (
                        <Link key={i} href={item.href}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                          <item.icon size={15} className="text-amber-400" />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 py-1.5">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── NOT LOGGED IN: login / signup ── */
              <>
                <Link href="/"
                  className="border-2 border-amber-500 text-amber-600 px-5 py-2 rounded-full text-sm font-semibold hover:bg-amber-500 hover:text-white transition-all duration-300 hover:scale-105">
                  Login
                </Link>
                <Link href="/"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
          </button>
        </div>

        {/* Mobile menu */}
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
                /* Mobile logged in */
                <div>
                  {/* User card */}
                  <div className="flex items-center gap-3 bg-amber-50 rounded-xl px-3 py-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-black shadow-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-amber-600 font-semibold">{user.plan || "Member"} Plan</p>
                      {user.gym && <p className="text-[10px] text-gray-500 truncate">📍 {user.gym}</p>}
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              ) : (
                /* Mobile not logged in */
                <div className="flex flex-col gap-2">
                  <Link href="/" className="border-2 border-amber-500 text-amber-600 px-6 py-2.5 rounded-full text-sm font-semibold text-center hover:bg-amber-500 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link href="/" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold text-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 pt-8 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="text-amber-500 w-6 h-6" />
                <span className="text-lg font-bold text-white">Fit<span className="text-amber-500">Zone</span></span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">
                Your trusted partner in fitness since 2014. 10+ years of transforming lives.
              </p>
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
                  <li key={item.href}>
                    <Link href={item.href} className="text-gray-400 hover:text-amber-500 transition-colors text-xs">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Contact Info</h4>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs">123 Fitness Ave, Andheri West, Mumbai – 400058</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-xs">+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-xs">hello@fitzone.in</span>
                </li>
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
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} FitZone. 10+ Years of Fitness Excellence. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
