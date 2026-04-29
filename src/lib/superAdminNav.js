
import {
  LayoutDashboard, Building2, Users, ShieldCheck, CreditCard,
  BarChart3, Bell, Star, Settings, FileText, ArrowLeftRight,
  PieChart, Globe, Megaphone, ClipboardList, UserCheck,
  Activity, Tag, BookOpen, GitBranch,
} from "lucide-react";

export const SUPER_ADMIN_NAV = [
  // ── Core ──
  { icon: LayoutDashboard, label: "Dashboard",       href: "/super-admin" },

  // ── Gym Management ──
  { icon: Building2,       label: "Gym Approvals",   href: "/super-admin/gyms",         badge: 12 },

  // ── User Management ──
  { icon: Users,           label: "All Members",     href: "/super-admin/members" },
  { icon: UserCheck,       label: "Trainers",        href: "/super-admin/trainers" },

  // ── Finances ──
  {
    icon: CreditCard, label: "Finances", href: "/super-admin/finances",
    children: [
      { icon: ArrowLeftRight, label: "Transactions", href: "/super-admin/finances/transactions" },
      { icon: FileText,       label: "Invoices",     href: "/super-admin/finances/invoices" },
      { icon: PieChart,       label: "Reports",      href: "/super-admin/finances/reports" },
    ],
  },

  // ── Analytics ──
  { icon: BarChart3,    label: "Analytics",        href: "/super-admin/analytics" },
  { icon: Activity,     label: "System Health",    href: "/super-admin/system" },

  // ── Plans ──
  { icon: ClipboardList,label: "Plans & Pricing",  href: "/super-admin/plans" },
  { icon: Tag,          label: "Promo Codes",      href: "/super-admin/promos" },

  // ── Moderation ──
  { icon: ShieldCheck,  label: "Moderation",       href: "/super-admin/moderation",   badge: 47 },
  { icon: Star,         label: "Reviews",          href: "/super-admin/reviews" },

  // ── Communication ──
  { icon: Megaphone,    label: "Notifications",    href: "/super-admin/notifications" },
  { icon: BookOpen,     label: "Blog / Content",   href: "/super-admin/blog" },

  // ── Platform ──
  { icon: Globe,        label: "Platform Config",  href: "/super-admin/platform" },
  { icon: GitBranch,    label: "Activity Logs",    href: "/super-admin/logs" },
];
