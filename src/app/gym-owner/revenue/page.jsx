"use client";
import RoleDashboardLayout from "@/components/RoleDashboardLayout";
import { GYM_OWNER_NAV } from "@/lib/gymOwnerNav";
import RevenueChart from "@/components/RevenueChart";
import { TrendingUp, TrendingDown, ArrowLeftRight, FileText, PieChart, ArrowRight } from "lucide-react";
import { iconBg, iconText } from "@/lib/colorMap";
import Link from "next/link";

export default function Page() {
  return (
    <RoleDashboardLayout title="Revenue" navItems={GYM_OWNER_NAV} role="gym-owner" userName="Suresh Nair" userEmail="suresh@ironparadise.in" userAvatar="SN">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text)]">Revenue</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Iron Paradise Fitness — financial overview</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Revenue (MTD)", value: "₹1.24L", change: "+8.1%", up: true },
            { label: "After Commission", value: "₹1.12L", change: "+8.1%", up: true },
            { label: "Refunds", value: "₹8,200", change: "-2.1%", up: false },
            { label: "Pending Payout", value: "₹24,000", change: "+5.2%", up: true },
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
            { icon: ArrowLeftRight, label: "Transactions", href: "/gym-owner/revenue/transactions", desc: "All payment records", color: "blue" },
            { icon: FileText,       label: "Invoices",     href: "/gym-owner/revenue/invoices",     desc: "Member invoices",   color: "purple" },
            { icon: PieChart,       label: "Reports",      href: "/gym-owner/revenue/reports",      desc: "Revenue analytics", color: "emerald" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group">
              <div className={`w-10 h-10 rounded-xl ${iconBg[item.color]} flex items-center justify-center mb-3`}>
                <item.icon size={20} className={iconText[item.color]} />
              </div>
              <p className="font-semibold text-[var(--text)]">{item.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{item.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight size={12} /></div>
            </Link>
          ))}
        </div>
        <RevenueChart />
      </div>
    </RoleDashboardLayout>
  );
}
