'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

/**
 * Task Distribution Pie Chart
 * Shows tasks by status
 * Mobile-first responsive design
 */
export function TaskPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-56 md:h-64">
        <p className="text-base-content/70 text-sm sm:text-base">
          No data available
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius="70%"
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Task Completion Bar Chart
 * Shows tasks completed over time
 * Mobile-first responsive design
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as BarTooltip,
  ResponsiveContainer as BarResponsiveContainer,
} from 'recharts';

export function TaskBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-56 md:h-64">
        <p className="text-base-content/70 text-sm sm:text-base">
          No data available
        </p>
      </div>
    );
  }

  return (
    <BarResponsiveContainer width="100%" height="100%" minHeight={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <BarTooltip />
        <Bar dataKey="tasks" fill="#3b82f6" />
      </BarChart>
    </BarResponsiveContainer>
  );
}
