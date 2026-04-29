"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

const data = [
  { day: "Sun", value: 3200 },
  { day: "Mon", value: 5100 },
  { day: "Tue", value: 8562, active: true },
  { day: "Wed", value: 4800 },
  { day: "Thu", value: 6200 },
  { day: "Fri", value: 5900 },
  { day: "Sat", value: 4100 },
];

export default function AttendanceChart() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[var(--text)]">Peak Day Activity</p>
        <button className="text-[var(--muted2)] hover:text-[var(--muted)] text-lg leading-none">···</button>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} barSize={26} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted2)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted2)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }}
            formatter={(v) => [v.toLocaleString(), "Check-ins"]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.active ? "#2563eb" : "var(--border)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Highest: <strong className="text-[var(--text)]">Tuesday</strong></span>
        <span className="text-blue-600 font-semibold">8,562 check-ins</span>
      </div>
    </div>
  );
}
