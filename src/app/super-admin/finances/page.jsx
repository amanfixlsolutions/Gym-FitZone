"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { SUPER_ADMIN_NAV } from "@/lib/superAdminNav";
import { TrendingUp, TrendingDown, ArrowLeftRight, FileText, PieChart, ArrowRight } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";
import Link from "next/link";

export default function Page() {
  return (
    <RoleDashboardLayout title="Finances" navItems={SUPER_ADMIN_NAV} role="super-admin" userName="Rajiv Sharma" userEmail="admin@fitzone.in" userAvatar="RS">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Finances</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Platform revenue, commissions and financial reports</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Collected",   value: "₹28.3L", change: "+12.4%", up: true },
            { label: "Commission Earned", value: "₹2.83L", change: "+12.4%", up: true },
            { label: "Refunds Issued",    value: "₹1.2L",  change: "-3.1%",  up: false },
            { label: "Pending Payouts",   value: "₹4.5L",  change: "+5.2%",  up: true },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs text-[var(--muted)] mb-2">{s.label}</p>
              <p className="text-xl md:text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.change}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: ArrowLeftRight, label: "Transactions", href: "/super-admin/finances/transactions", desc: "All payment records + commission", color: "blue" },
            { icon: FileText,       label: "Invoices",     href: "/super-admin/finances/invoices",     desc: "Platform invoices",              color: "purple" },
            { icon: PieChart,       label: "Reports",      href: "/super-admin/finances/reports",      desc: "Revenue analytics & exports",    color: "emerald" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:border-violet-300 transition-all group">
              <div className={`w-10 h-10 rounded-xl ${iconBg[item.color]} flex items-center justify-center mb-3`}>
                <item.icon size={20} className={iconText[item.color]} />
              </div>
              <p className="font-semibold text-[var(--text)]">{item.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{item.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-violet-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight size={12} /></div>
            </Link>
          ))}
        </div>
      </div>
    </RoleDashboardLayout>
  );
}
