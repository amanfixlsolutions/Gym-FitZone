"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FALLBACK = [
  { date: "Week 1", revenue: 0 },
  { date: "Week 2", revenue: 0 },
  { date: "Week 3", revenue: 0 },
  { date: "Week 4", revenue: 0 },
];

const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-3 text-xs">
        <p className="font-semibold text-[var(--text)] mb-1.5">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <span className="text-[var(--muted)]">Revenue:</span>
          <span className="font-bold text-[var(--text)]">₹{payload[0]?.value?.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data: propData, totalRevenue, activeMembers, newJoins }) {
  const chartData = propData?.length
    ? propData.map((d, i) => ({ date: d.month || `W${i + 1}`, revenue: d.revenue || 0 }))
    : FALLBACK;

  const total = totalRevenue || chartData.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)] mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-[var(--text)]">
            ₹{total >= 100000 ? `${(total / 100000).toFixed(2)}L` : total.toLocaleString()}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full mt-1">
            ↑ Revenue this period
          </span>
        </div>
        <button className="text-[var(--muted2)] hover:text-[var(--muted)] text-lg leading-none">···</button>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted2)" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted2)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
          />
          <Tooltip content={<RevenueTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#colorRevenue)"
            dot={false}
            activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Active Members", value: (activeMembers || 0).toLocaleString(),  color: "bg-blue-500" },
          { label: "Total Members",  value: (newJoins || 0).toLocaleString(),        color: "bg-emerald-500" },
          { label: "Total Revenue",  value: `₹${total >= 100000 ? `${(total / 100000).toFixed(1)}L` : total.toLocaleString()}`, color: "bg-amber-500" },
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
