"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, ChevronDown, Sun, Moon, Bell,
  Search, LogOut, Settings, Download, Calendar, Dumbbell,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { notificationAPI } from "@/lib/api";

export default function RoleDashboardLayout({
  children, title, navItems, role,
  userName: _userName, userEmail: _userEmail, userAvatar: _userAvatar,
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const { dark, toggle } = useTheme();
  const { user, logoutUser, loaded } = useAuth();

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen,       setMobileOpen]       = useState(false);
  const [openMenus,        setOpenMenus]        = useState({});
  const [showNotif,        setShowNotif]        = useState(false);
  const [showProfile,      setShowProfile]      = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [notifs,           setNotifs]           = useState([]);
  const [unreadCount,      setUnreadCount]      = useState(0);
  const [currentDate,      setCurrentDate]      = useState("");
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  // ── Set current date ───────────────────────────────────────────
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString("en-IN", { month: "short", year: "numeric" }));
  }, []);

  // ── Fetch real notifications ───────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    try {
      const res = await notificationAPI.getAll({ limit: 5, unread: "false" });
      setNotifs(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (loaded && user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [loaded, user, fetchNotifs]);

  // ── Socket.io — join role room for real-time notifications ─────
  useEffect(() => {
    if (!loaded || !user) return;
    let socket = null;
    const connectSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        const token = typeof window !== "undefined" ? localStorage.getItem("fitzone_token") : null;
        if (!token) return;
        const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
        socket = io(BACKEND, {
          auth: { token },
          transports: ["websocket", "polling"],
          reconnection: true,
        });
        socket.on("connect", () => {
          // Join role room so super-admin gets all important events
          if (user.role) socket.emit("join-role", user.role);
          // Join gym room if gym-owner
          if (user.gym) socket.emit("join-gym", user.gym);
        });
        socket.on("notification", () => {
          // Re-fetch notifications when a new one arrives
          fetchNotifs();
        });
      } catch { /* socket.io-client may not be installed */ }
    };
    connectSocket();
    return () => { if (socket) socket.disconnect(); };
  }, [loaded, user, fetchNotifs]);

  // ── Mark notification as read ──────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifs(p => p.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(p => Math.max(0, p - 1));
    } catch {}
  };

  // ── Export current page data as CSV ───────────────────────────
  const handleExport = () => {
    // Collect all visible table data from the current page DOM
    const tables = document.querySelectorAll("table");
    if (tables.length === 0) {
      // No table — export page title + date as minimal CSV
      const csv = `"FitZone Export","${title}"\n"Date","${new Date().toLocaleDateString("en-IN")}"\n"Page","${window.location.pathname}"`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `fitzone_${title.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Export the first (main) table on the page
    const table = tables[0];
    const rows  = [];

    // Headers
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText.trim());
    if (headers.length) rows.push(headers);

    // Body rows
    table.querySelectorAll("tbody tr").forEach(tr => {
      const cells = Array.from(tr.querySelectorAll("td")).map(td => {
        // Get text content, strip extra whitespace
        return td.innerText.replace(/\n+/g, " ").trim();
      });
      if (cells.some(c => c)) rows.push(cells);
    });

    if (rows.length === 0) {
      rows.push([`FitZone Export - ${title}`, new Date().toLocaleDateString("en-IN")]);
    }

    const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `fitzone_${title.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Search — navigate to relevant page ────────────────────────
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const q   = searchQuery.trim().toLowerCase();
      const enc = encodeURIComponent(searchQuery.trim());

      // Build route map based on role
      const base = role === "super-admin" ? "/super-admin" : `/${role}`;

      // Route by keyword in query
      let path;
      if (q.includes("trainer"))    path = `${base}/trainers?search=${enc}`;
      else if (q.includes("class")) path = role === "super-admin" ? `${base}/analytics` : `${base}/classes?search=${enc}`;
      else if (q.includes("plan"))  path = `${base}/plans?search=${enc}`;
      else if (q.includes("gym"))   path = role === "super-admin" ? `${base}/gyms?search=${enc}` : `${base}/settings`;
      else if (q.includes("invoice") || q.includes("payment") || q.includes("revenue"))
                                    path = role === "super-admin" ? `${base}/finances/transactions?search=${enc}` : `${base}/revenue/transactions?search=${enc}`;
      else if (q.includes("promo")) path = role === "super-admin" ? `${base}/promos?search=${enc}` : `${base}/marketing`;
      else if (q.includes("blog"))  path = role === "super-admin" ? `${base}/blog?search=${enc}` : `${base}/marketing`;
      else if (q.includes("log"))   path = role === "super-admin" ? `${base}/logs?search=${enc}` : `${base}/attendance`;
      else                          path = `${base}/members?search=${enc}`;

      router.push(path);
      setSearchQuery("");
    }
  };

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

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (loaded && !user) router.push("/login");
  }, [loaded, user, router]);

  const userName   = user?.name   || _userName   || "User";
  const userEmail  = user?.email  || _userEmail  || "";
  const userAvatar = user?.avatar || _userAvatar
    || (user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U");

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

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

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const formatNotifTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    if (mins < 1)  return "now";
    if (mins < 60) return `${mins}m`;
    if (hrs < 24)  return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const dotColor = (type) => ({
    member: "bg-blue-500", payment: "bg-emerald-500",
    class: "bg-purple-500", alert: "bg-amber-500",
    trainer: "bg-teal-500", system: "bg-gray-400",
  }[type] || "bg-gray-400");

  // ─── Sidebar inner content ────────────────────────────────────
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
        <button
          onClick={() => setDesktopCollapsed((c) => !c)}
          className={`hidden lg:flex p-1.5 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)] transition-colors flex-shrink-0 ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <Menu size={15} /> : <X size={15} />}
        </button>
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
          const open   = openMenus[item.label];
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
                          ${ca
                            ? "text-blue-600 bg-blue-50 font-semibold dark:bg-blue-900/30 dark:text-blue-400"
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
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && "Logout"}
        </button>
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

          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg
              hover:bg-[var(--surface2)] transition-colors flex-shrink-0"
          >
            <Menu size={20} className="text-[var(--muted)]" />
          </button>

          <h2 className="text-sm md:text-base font-semibold text-[var(--text)] whitespace-nowrap">
            {title}
          </h2>

          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted2)]" />
            <input
              type="text"
              placeholder="Search members, trainers, classes... (Enter)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface2)] border border-[var(--border)]
                rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                text-[var(--text)] placeholder:text-[var(--muted2)] transition-all"
            />
          </div>

          <div className="flex-1" />

          {/* Calendar — shows current month */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-[var(--muted)]
            bg-[var(--surface2)] border border-[var(--border)] px-3 py-1.5 rounded-lg whitespace-nowrap">
            <Calendar size={14} className="text-[var(--muted2)]" />
            <span>{currentDate || new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className={`hidden sm:flex items-center gap-2 text-xs font-semibold text-white
              ${accent.solid} ${accent.hover} px-3 py-1.5 rounded-lg transition-all shadow-sm whitespace-nowrap`}
            title="Export current page data"
          >
            <Download size={14} />
            <span className="hidden xl:inline">Export</span>
          </button>

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
              onClick={() => { setShowNotif(v => !v); setShowProfile(false); if (!showNotif) fetchNotifs(); }}
              className="w-9 h-9 flex items-center justify-center rounded-lg
                hover:bg-[var(--surface2)] transition-colors relative"
            >
              <Bell size={18} className="text-[var(--muted)]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full
                  border-2 border-[var(--surface)]" />
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-12 w-[320px] bg-[var(--surface)]
                border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--text)]">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30
                      dark:text-red-400 font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                  )}
                </div>
                {notifs.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-[var(--muted)]">
                    No notifications yet
                  </div>
                ) : (
                  notifs.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkRead(n._id)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface2)]
                        cursor-pointer border-b border-[var(--border)] last:border-0 transition-colors
                        ${!n.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor(n.type)}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm text-[var(--text)] ${!n.read ? "font-semibold" : "font-medium"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-[var(--muted)] truncate">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-[var(--muted2)] whitespace-nowrap">
                        {formatNotifTime(n.createdAt)}
                      </span>
                    </div>
                  ))
                )}
                <div className="px-4 py-2.5 border-t border-[var(--border)]">
                  <Link
                    href={`/${role}/notifications`}
                    onClick={() => setShowNotif(false)}
                    className="text-xs text-blue-600 font-medium hover:text-blue-700"
                  >
                    View all notifications →
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
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
                      hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={14} /> Logout
                  </button>
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
