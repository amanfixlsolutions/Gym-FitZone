"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceChart({ data: propData }) {
  // Build chart data from real attendance or fallback to zeros
  const chartData = propData?.length
    ? propData.map((d, i) => ({
        day: d.date ? new Date(d.date).toLocaleDateString("en", { weekday: "short" }) : DAYS[i] || `D${i}`,
        value: d.count || 0,
      }))
    : DAYS.map(d => ({ day: d, value: 0 }));

  const maxEntry = chartData.reduce((max, d) => d.value > max.value ? d : max, { day: "—", value: 0 });

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[var(--text)]">Peak Day Activity</p>
        <button className="text-[var(--muted2)] hover:text-[var(--muted)] text-lg leading-none">···</button>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={chartData} barSize={26} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted2)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted2)" }} axisLine={false} tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }}
            formatter={(v) => [v.toLocaleString(), "Check-ins"]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.day === maxEntry.day ? "#2563eb" : "var(--border)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Highest: <strong className="text-[var(--text)]">{maxEntry.day}</strong></span>
        <span className="text-blue-600 font-semibold">{maxEntry.value.toLocaleString()} check-ins</span>
      </div>
    </div>
  );
}
