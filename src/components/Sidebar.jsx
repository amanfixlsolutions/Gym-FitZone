"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Dumbbell, CalendarCheck, CreditCard,
  BarChart3, Settings, HelpCircle, ChevronDown, Star, ShieldCheck,
  Bell, Zap, ClipboardList, UserCheck, FileText, ArrowLeftRight,
  PieChart, Menu, X,
} from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/" },
  { icon: Users,           label: "Members",         href: "/members",      badge: 46 },
  { icon: Dumbbell,        label: "Gyms",            href: "/gyms" },
  { icon: CalendarCheck,   label: "Bookings",        href: "/bookings" },
  {
    icon: CreditCard, label: "Finances", href: "/finances",
    children: [
      { icon: FileText,        label: "Invoices",     href: "/finances/invoices" },
      { icon: ArrowLeftRight,  label: "Transactions", href: "/finances/transactions" },
      { icon: PieChart,        label: "Reports",      href: "/finances/reports" },
    ],
  },
  { icon: BarChart3,    label: "Analytics",    href: "/analytics" },
  { icon: ClipboardList,label: "Plans",        href: "/plans" },
  { icon: UserCheck,    label: "Trainers",     href: "/trainers" },
  { icon: Star,         label: "Reviews",      href: "/reviews" },
  { icon: Bell,         label: "Notifications",href: "/notifications" },
  { icon: ShieldCheck,  label: "Moderation",   href: "/moderation" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({ Finances: true });
  const [collapsed, setCollapsed] = useState(false);

  const toggle = (label) =>
    setOpenMenus((p) => ({ ...p, [label]: !p[label] }));

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-30 h-screen flex flex-col
          bg-[var(--surface)] border-r border-[var(--border)]
          shadow-sm transition-all duration-300
          ${collapsed ? "w-[68px]" : "w-[230px]"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-[18px] border-b border-[var(--border)]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Dumbbell size={16} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-[15px] text-[var(--text)] tracking-tight whitespace-nowrap">
              FitZone
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`ml-auto p-1 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)] transition-colors ${collapsed ? "mx-auto" : ""}`}
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const open = openMenus[item.label];

            return (
              <div key={item.label}>
                {/* Parent item */}
                {item.children ? (
                  <button
                    onClick={() => toggle(item.label)}
                    title={collapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-150 group
                      ${active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
                      }
                    `}
                  >
                    <item.icon size={16} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-150 group
                      ${active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
                      }
                    `}
                  >
                    <item.icon size={16} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            active ? "bg-white/25 text-white" : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )}

                {/* Children dropdown */}
                {item.children && open && !collapsed && (
                  <div className="ml-4 mt-0.5 pl-3 border-l-2 border-[var(--border)] space-y-0.5">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`
                            flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                            transition-all duration-150
                            ${childActive
                              ? "text-blue-600 bg-blue-50 font-semibold dark:bg-blue-900/30 dark:text-blue-400"
                              : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]"
                            }
                          `}
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
        <div className="px-2 pb-3 border-t border-[var(--border)] pt-2 space-y-0.5">
          <Link
            href="/settings"
            title={collapsed ? "Settings" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all ${
              pathname === "/settings" ? "bg-blue-600 text-white" : ""
            }`}
          >
            <Settings size={16} className="flex-shrink-0" />
            {!collapsed && "Settings"}
          </Link>
          <Link
            href="/help"
            title={collapsed ? "Help" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all"
          >
            <HelpCircle size={16} className="flex-shrink-0" />
            {!collapsed && "Help & Support"}
          </Link>

          {/* Upgrade card — hide when collapsed */}
          {!collapsed && (
            <div className="mt-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                <Zap size={14} className="text-white" />
              </div>
              <p className="font-semibold text-sm">Upgrade to Pro!</p>
              <p className="text-[11px] text-blue-100 mt-0.5 leading-relaxed">
                Unlock AI features & advanced analytics
              </p>
              <button className="mt-3 w-full bg-white text-blue-600 text-xs font-bold py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                Upgrade now
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
