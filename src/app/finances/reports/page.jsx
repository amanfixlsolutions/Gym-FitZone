import DashboardLayout from "@/components/DashboardLayout";
import { PieChart, Download, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  return (
    <DashboardLayout title="Reports">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Financial Reports</h1>
            <p className="text-sm text-[var(--muted)] mt-1">Revenue analytics and downloadable reports</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} /> Download PDF
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Monthly Revenue Report", desc: "Jan 2025 – Full breakdown", size: "2.4 MB", type: "PDF" },
            { label: "Quarterly Summary", desc: "Q4 2024 – Oct to Dec", size: "4.1 MB", type: "Excel" },
            { label: "Annual Report 2024", desc: "Full year financial overview", size: "8.7 MB", type: "PDF" },
          ].map((r) => (
            <div key={r.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-3">
                <PieChart size={20} className="text-blue-600" />
              </div>
              <p className="font-semibold text-[var(--text)]">{r.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{r.desc}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-[var(--muted2)]">{r.size} · {r.type}</span>
                <button className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700">
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <p className="font-semibold text-[var(--text)] mb-4">Revenue Breakdown by Category</p>
          <div className="space-y-3">
            {[
              { label: "Yearly Memberships", value: "₹12.4L", pct: 44 },
              { label: "Quarterly Memberships", value: "₹8.2L", pct: 29 },
              { label: "Monthly Memberships", value: "₹5.1L", pct: 18 },
              { label: "Class Passes", value: "₹1.8L", pct: 6 },
              { label: "Day Passes", value: "₹0.8L", pct: 3 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm text-[var(--text)] w-48 flex-shrink-0">{item.label}</span>
                <div className="flex-1 bg-[var(--surface2)] rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-sm font-semibold text-[var(--text)] w-16 text-right">{item.value}</span>
                <span className="text-xs text-[var(--muted)] w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
