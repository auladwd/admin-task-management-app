'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

/** Custom styled tooltip for charts */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-base-100/95 backdrop-blur-md border border-base-300 rounded-xl p-2.5 shadow-soft-lg text-xs">
        <p className="font-bold text-base-content">{label || data.name}</p>
        <p className="text-primary font-semibold mt-0.5">
          {data.value} {data.unit || 'tasks'}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Task Distribution Donut Chart
 * Modern donut chart representation with vibrant colors
 */
export function TaskPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 sm:h-56 md:h-64 text-base-content/40">
        <p className="text-sm font-medium">No task distribution data yet</p>
      </div>
    );
  }

  // Modern vibrant palette for statuses
  const modernPalette = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || modernPalette[index % modernPalette.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Task Completion Trend Bar Chart
 * Modern bar chart with rounded bars and refined axes
 */
export function TaskBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 sm:h-56 md:h-64 text-base-content/40">
        <p className="text-sm font-medium">No completion trend data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
          axisLine={{ opacity: 0.2 }}
          tickLine={false}
          angle={-30}
          textAnchor="end"
          height={45}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="tasks"
          fill="#4F46E5"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
