"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function RetentionGauge({ active = 0, total = 0 }) {
  const value = total > 0 ? Math.round((active / total) * 100) : 0;
  const gaugeData = [{ value }, { value: 100 - value }];
  const COLORS = ["#10b981", "var(--border)"];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-[var(--text)]">Member Retention Rate</p>
        <button className="text-[var(--muted2)] hover:text-[var(--muted)] text-lg leading-none">···</button>
      </div>

      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%" cy="80%"
              startAngle={180} endAngle={0}
              innerRadius={55} outerRadius={75}
              dataKey="value" strokeWidth={0}
            >
              {gaugeData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 text-center">
          <p className="text-3xl font-bold text-[var(--text)]">{value}%</p>
        </div>
      </div>

      <p className="text-xs text-[var(--muted)] text-center mt-1">
        {active.toLocaleString()} active of{" "}
        <span className="font-semibold text-[var(--text)]">{total.toLocaleString()} total</span> members
      </p>
    </div>
  );
}
