import {
  LayoutDashboard, Users, CalendarCheck, CreditCard, BarChart3,
  Bell, UserCheck, ClipboardList, QrCode, Megaphone,
  FileText, ArrowLeftRight, PieChart, Package,
} from "lucide-react";

export const GYM_OWNER_NAV = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/gym-owner" },
  { icon: Users,           label: "My Members",    href: "/gym-owner/members",  badge: 8 },
  { icon: CalendarCheck,   label: "Classes",       href: "/gym-owner/classes" },
  { icon: UserCheck,       label: "Trainers",      href: "/gym-owner/trainers" },
  { icon: QrCode,          label: "Attendance",    href: "/gym-owner/attendance" },
  {
    icon: CreditCard, label: "Revenue", href: "/gym-owner/revenue",
    children: [
      { icon: ArrowLeftRight, label: "Transactions", href: "/gym-owner/revenue/transactions" },
      { icon: FileText,       label: "Invoices",     href: "/gym-owner/revenue/invoices" },
      { icon: PieChart,       label: "Reports",      href: "/gym-owner/revenue/reports" },
    ],
  },
  { icon: ClipboardList, label: "Plans & Pricing", href: "/gym-owner/plans" },
  { icon: BarChart3,     label: "Analytics",       href: "/gym-owner/analytics" },
  { icon: Package,       label: "Inventory",       href: "/gym-owner/inventory" },
  { icon: Megaphone,     label: "Marketing",       href: "/gym-owner/marketing" },
  { icon: Bell,          label: "Notifications",   href: "/gym-owner/notifications" },
];
