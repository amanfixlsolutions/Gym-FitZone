"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const RADIAN = Math.PI / 180;
const value = 68;

// Gauge data: filled + empty
const gaugeData = [
  { value: value },
  { value: 100 - value },
];

const COLORS = ["#10b981", "#e5e7eb"];

export default function RetentionGauge() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-800">Member Retention Rate</p>
        <button className="text-gray-400 hover:text-gray-600 text-lg leading-none">···</button>
      </div>

      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
              strokeWidth={0}
            >
              {gaugeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 text-center">
          <p className="text-3xl font-bold text-gray-900">68%</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-1">
        On track for <span className="font-semibold text-gray-700">90% target</span>
      </p>
      <button className="mt-3 w-full text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
        Show details →
      </button>
    </div>
  );
}
