"use client";

import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00'); // Parse as local time
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
};

export function HabitCompletionGraph() {
  const data = useQuery(api.habits.getCompletionHistory) || [];

  // Build last 7 days using local time, not UTC
  const last7Local: { date: string; completed: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0); // Set to local midnight
    d.setDate(d.getDate() - i);
    // Format as YYYY-MM-DD in local time
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
    const found = data.find(entry => entry.date === dateStr);
    last7Local.push({
      date: dateStr,
      completed: found ? found.completed : 0,
    });
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Habits Completed (Last 7 Days)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={last7Local} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis allowDecimals={false} />
          <Tooltip labelFormatter={formatDate} formatter={(v: number) => [`${v} completed`, 'Habits']} />
          <Bar dataKey="completed" fill="#4ade80" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 