"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { date: "1 Jan", revenue: 28000, lastMonth: 22000 },
  { date: "8 Jan", revenue: 35000, lastMonth: 28000 },
  { date: "15 Jan", revenue: 31000, lastMonth: 30000 },
  { date: "18 Jan", revenue: 51200, lastMonth: 35563 },
  { date: "22 Jan", revenue: 42000, lastMonth: 38000 },
  { date: "29 Jan", revenue: 48000, lastMonth: 40000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-3 text-xs">
        <p className="font-semibold text-[var(--text)] mb-1.5">{label}</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <span className="text-[var(--muted)]">This month:</span>
          <span className="font-bold text-[var(--text)]">₹{payload[0]?.value?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
          <span className="text-[var(--muted)]">Last month:</span>
          <span className="font-bold text-[var(--muted)]">₹{payload[1]?.value?.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)] mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-[var(--text)]">₹4,46,700</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full mt-1">
            ↑ 24.4% vs last period
          </span>
        </div>
        <button className="text-[var(--muted2)] hover:text-[var(--muted)] text-lg leading-none">···</button>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted2)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted2)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
          <Area type="monotone" dataKey="lastMonth" stroke="#9ca3af" strokeWidth={1.5} fill="url(#colorLast)" dot={false} strokeDasharray="4 4" />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Active Members", value: "2,884", color: "bg-blue-500" },
          { label: "New Joins", value: "1,432", color: "bg-emerald-500" },
          { label: "Churned", value: "562", color: "bg-amber-500" },
        ].map((item) => (
          <div key={item.label} className="bg-[var(--surface2)] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-xs text-[var(--muted)]">{item.label}</span>
            </div>
            <p className="text-base font-bold text-[var(--text)]">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
