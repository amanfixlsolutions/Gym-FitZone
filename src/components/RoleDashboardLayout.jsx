"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronDown, Sun, Moon, Bell,
  Search, LogOut, Settings, Download, Calendar, Dumbbell,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function RoleDashboardLayout({
  children, title, navItems, role,
  userName, userEmail, userAvatar,
}) {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();

  // Desktop sidebar: collapsed = icon-only
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  // Mobile sidebar: open = slide-in drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const [openMenus, setOpenMenus] = useState({});
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Auto-open parent dropdown when a child route is active
  useEffect(() => {
    const initial = {};
    navItems.forEach((item) => {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        initial[item.label] = true;
      }
    });
    setOpenMenus(initial);
  }, [pathname]); // eslint-disable-line

  // Close dropdowns on outside click
  useEffect(() => {
    const fn = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggleMenu = (label) => setOpenMenus((p) => ({ ...p, [label]: !p[label] }));

  const isActive = (href) =>
    href === `/${role}` ? pathname === `/${role}` : pathname.startsWith(href);

  const accent = {
    "super-admin": {
      solid: "bg-violet-600", hover: "hover:bg-violet-700",
      grad: "from-violet-600 to-purple-700",
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
      activeBadge: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
      label: "Super Admin",
    },
    "gym-owner": {
      solid: "bg-blue-600", hover: "hover:bg-blue-700",
      grad: "from-blue-600 to-blue-700",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      activeBadge: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
      label: "Gym Admin",
    },
  }[role] ?? {
    solid: "bg-blue-600", hover: "hover:bg-blue-700",
    grad: "from-blue-600 to-blue-700",
    badge: "bg-blue-100 text-blue-700",
    activeBadge: "bg-blue-100 text-blue-600",
    label: "Admin",
  };

  // ─── Sidebar inner content (reused for both desktop + mobile) ───
  const SidebarContent = ({ collapsed }) => (
    <>
      {/* Logo row */}
      <div className="flex items-center gap-3 px-4 h-[60px] border-b border-[var(--border)] flex-shrink-0">
        <div className={`w-8 h-8 bg-gradient-to-br ${accent.grad} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Dumbbell size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[14px] text-[var(--text)] leading-tight">FitZone</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${accent.badge}`}>
              {accent.label}
            </span>
          </div>
        )}
        {/* Desktop collapse toggle - only show on desktop */}
        <button
          onClick={() => setDesktopCollapsed((c) => !c)}
          className={`hidden lg:flex p-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)] transition-colors flex-shrink-0 ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <Menu size={15} /> : <X size={15} />}
        </button>
        {/* Mobile close - only show on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)] transition-colors ml-auto"
        >
          <X size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const open = openMenus[item.label];
          return (
            <div key={item.label}>
              {item.children ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${active ? `${accent.solid} text-white shadow-sm` : "text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"}`}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`} />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${active ? `${accent.solid} text-white shadow-sm` : "text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"}`}
                >
                  <item.icon size={16} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge != null && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                          ${active ? "bg-white/25 text-white" : accent.activeBadge}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )}

              {/* Dropdown children */}
              {item.children && open && !collapsed && (
                <div className="ml-4 mt-0.5 pl-3 border-l-2 border-[var(--border)] space-y-0.5">
                  {item.children.map((child) => {
                    const ca = pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                          ${ca ? "text-blue-600 bg-blue-50 font-semibold dark:bg-blue-900/30 dark:text-blue-400"
                            : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]"}`}
                      >
                        <child.icon size={14} className="flex-shrink-0" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 border-t border-[var(--border)] pt-2 space-y-0.5 flex-shrink-0">
        <Link
          href={`/${role}/settings`}
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
            ${pathname === `/${role}/settings` ? `${accent.solid} text-white` : "text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"}`}
        >
          <Settings size={16} className="flex-shrink-0" />
          {!collapsed && "Settings"}
        </Link>
        <Link
          href="/"
          title={collapsed ? "Switch Role" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && "Switch Role"}
        </Link>
        {!collapsed && (
          <div className={`mt-2 bg-gradient-to-br ${accent.grad} rounded-xl p-4 text-white`}>
            <p className="font-semibold text-sm">FitZone Pro</p>
            <p className="text-[11px] text-white/70 mt-0.5">AI features & advanced analytics</p>
            <button className="mt-2 w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-1.5 rounded-lg transition-colors">
              Upgrade
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[260px] flex flex-col
          bg-[var(--surface)] border-r border-[var(--border)] shadow-xl
          transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent collapsed={false} />
      </aside>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 z-30 h-screen flex-col
          bg-[var(--surface)] border-r border-[var(--border)] shadow-sm
          transition-all duration-300
          ${desktopCollapsed ? "w-[68px]" : "w-[240px]"}`}
      >
        <SidebarContent collapsed={desktopCollapsed} />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300
        ${desktopCollapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"} ml-0`}>

        {/* ── TOPBAR ── */}
        <header className="h-[60px] bg-[var(--surface)] border-b border-[var(--border)]
          flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20 shadow-sm">

          {/* Mobile hamburger - only visible on mobile/tablet */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg
              hover:bg-[var(--surface2)] transition-colors flex-shrink-0"
          >
            <Menu size={20} className="text-[var(--muted)]" />
          </button>

          {/* Page title */}
          <h2 className="text-sm md:text-base font-semibold text-[var(--text)] whitespace-nowrap">
            {title}
          </h2>

          {/* Search bar - responsive sizing */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)]
                rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                text-[var(--text)] placeholder:text-[var(--muted2)] transition-all"
            />
          </div>

          <div className="flex-1" />

          {/* Date picker - desktop only */}
          <button className="hidden lg:flex items-center gap-2 text-xs text-[var(--muted)]
            bg-[var(--surface2)] border border-[var(--border)] px-3 py-1.5 rounded-lg
            hover:border-blue-400 hover:bg-[var(--surface3)] transition-all whitespace-nowrap">
            <Calendar size={14} className="text-[var(--muted2)]" />
            <span>Jan 2025</span>
            <ChevronDown size={12} />
          </button>

          {/* Export button */}
          <button className={`hidden sm:flex items-center gap-2 text-xs font-semibold text-white
            ${accent.solid} ${accent.hover} px-3 py-1.5 rounded-lg transition-all shadow-sm whitespace-nowrap`}>
            <Download size={14} />
            <span className="hidden xl:inline">Export</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg
              hover:bg-[var(--surface2)] transition-colors flex-shrink-0"
            aria-label="Toggle theme"
          >
            {dark
              ? <Sun size={18} className="text-amber-400" />
              : <Moon size={18} className="text-[var(--muted)]" />
            }
          </button>

          {/* Notifications */}
          <div className="relative flex-shrink-0" ref={notifRef}>
            <button
              onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
              className="w-9 h-9 flex items-center justify-center rounded-lg
                hover:bg-[var(--surface2)] transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-[var(--muted)]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full
                border-2 border-[var(--surface)]" />
            </button>
            {showNotif && (
              <div className="absolute right-0 top-12 w-[320px] bg-[var(--surface)]
                border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--text)]">Notifications</p>
                  <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30
                    dark:text-red-400 font-bold px-2 py-0.5 rounded-full">3 new</span>
                </div>
                {[
                  { dot: "bg-blue-500", t: "New member joined", d: "Rahul Sharma joined your gym", time: "2m" },
                  { dot: "bg-emerald-500", t: "Payment received", d: "₹2,999 credited", time: "15m" },
                  { dot: "bg-amber-500", t: "Class reminder", d: "Yoga starts in 30 minutes", time: "30m" },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface2)]
                    cursor-pointer border-b border-[var(--border)] last:border-0 transition-colors">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)]">{n.t}</p>
                      <p className="text-xs text-[var(--muted)] truncate">{n.d}</p>
                    </div>
                    <span className="text-[10px] text-[var(--muted2)] whitespace-nowrap">{n.time}</span>
                  </div>
                ))}
                <div className="px-4 py-2.5 border-t border-[var(--border)]">
                  <Link href={`/${role}/notifications`}
                    className="text-xs text-blue-600 font-medium hover:text-blue-700">
                    View all →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative flex-shrink-0" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl
                hover:bg-[var(--surface2)] transition-colors"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${accent.grad}
                flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {userAvatar || "?"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-[var(--text)] leading-tight">{userName}</p>
                <p className="text-[10px] text-[var(--muted)]">{accent.label}</p>
              </div>
              <ChevronDown size={14} className="text-[var(--muted2)] hidden lg:block" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-12 w-56 bg-[var(--surface)]
                border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--text)]">{userName}</p>
                  <p className="text-xs text-[var(--muted)] truncate">{userEmail}</p>
                </div>
                <div className="py-1">
                  <Link
                    href={`/${role}/settings`}
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--muted)]
                      hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-colors"
                  >
                    <Settings size={14} /> Settings
                  </Link>
                </div>
                <div className="border-t border-[var(--border)] py-1">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
                      hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={14} /> Switch Role
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}