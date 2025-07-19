"use client";

import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

function formatDay(dayOrDate: string | null) {
  if (!dayOrDate) return "-";
  
  // If it's already a day name (like "Monday"), return it
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (dayNames.includes(dayOrDate)) {
    return dayOrDate;
  }
  
  // If it's a date string, format it
  const date = new Date(dayOrDate + 'T00:00:00');
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function HabitAnalytics() {
  const analytics = useQuery(api.habits.getAnalytics);

  if (!analytics) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Analytics & Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-gray-600 mb-1">Overall Completion Rate</p>
          <p className="text-2xl font-bold text-blue-600">{analytics.overallCompletionRate}%</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Last 7 Days Completion Rate</p>
          <p className="text-2xl font-bold text-green-600">{analytics.last7DaysCompletionRate}%</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Best Day</p>
          <p className="text-lg font-semibold text-gray-900">{formatDay(analytics.bestDay)} <span className="text-blue-500">({analytics.bestDayCount})</span></p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Worst Day</p>
          <p className="text-lg font-semibold text-gray-900">{formatDay(analytics.worstDay)} <span className="text-red-500">({analytics.worstDayCount})</span></p>
        </div>
      </div>
    </div>
  );
} 