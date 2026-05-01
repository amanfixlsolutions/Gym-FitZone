"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#f59e0b", "#ef4444", "#6b7280"];

const PlanTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-2.5 text-xs">
        <p className="font-semibold text-[var(--text)]">{payload[0].name}</p>
        <p className="text-[var(--muted)]">{payload[0].value.toLocaleString()} subscribers</p>
      </div>
    );
  }
  return null;
};

export default function PlanDistribution({ data: propData }) {
  const data = propData?.length
    ? propData.map((d, i) => ({
        name:  d._id || d.name || `Plan ${i + 1}`,
        value: d.count || d.value || 0,
      }))
    : [];

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[var(--text)]">Plan Distribution</p>
        <button className="text-[var(--muted2)] hover:text-[var(--muted)] text-lg leading-none">···</button>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-[var(--muted)]">
          No plan data yet
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={38} outerRadius={58}
                dataKey="value"
                strokeWidth={2}
                stroke="var(--surface)"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PlanTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-2">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs text-[var(--muted)]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[var(--muted2)]">
                    {total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : "0%"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
