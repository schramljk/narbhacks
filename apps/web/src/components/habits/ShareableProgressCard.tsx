"use client";

import { useUser } from "@clerk/nextjs";

interface ShareableProgressCardProps {
  includeStreak?: boolean;
  includeChart?: boolean;
  includeStats?: boolean;
  className?: string;
}

export function ShareableProgressCard({ 
  includeStreak = true, 
  includeChart = true, 
  includeStats = true,
  className = ""
}: ShareableProgressCardProps) {
  const { user } = useUser();

  // Mock data for now
  const analytics = {
    overallCompletionRate: 85,
    recentCompletionRate: 90,
    bestDay: "Monday",
    worstDay: "Sunday",
    totalHabits: 5,
    currentStreak: 15,
    longestStreak: 20
  };

  const last7Days = [3, 5, 4, 6, 5, 7, 6];
  const maxCompletions = Math.max(...last7Days, 1);

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`} style={{ width: "400px", height: "600px" }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mr-2">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
        </div>
        <p className="text-sm text-gray-600">
          {user?.firstName ? `${user.firstName}'s Progress Report` : 'My Progress Report'}
        </p>
      </div>

      {/* Streak */}
      {includeStreak && (
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-4 mb-4 text-center text-white">
          <div className="text-2xl font-bold">
            🔥 {analytics.currentStreak} Day Streak
          </div>
          <div className="text-sm opacity-90">
            {analytics.currentStreak > 0 ? "Keep it up!" : "Start building your streak!"}
          </div>
        </div>
      )}

      {/* Stats */}
      {includeStats && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(analytics.overallCompletionRate)}%
            </div>
            <div className="text-xs text-gray-600">Completion Rate</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.totalHabits}
            </div>
            <div className="text-xs text-gray-600">Active Habits</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {includeChart && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Last 7 Days</h3>
          <div className="flex items-end justify-between h-20">
            {last7Days.map((completions, index) => (
              <div
                key={index}
                className="bg-green-400 rounded-t w-6"
                style={{ height: `${(completions / maxCompletions) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <span key={index}>{day}</span>
            ))}
          </div>
        </div>
      )}

      {/* Best/Worst Day */}
      {includeStats && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-sm font-medium text-green-700">Best Day</div>
            <div className="text-xs text-green-600">{analytics.bestDay}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-sm font-medium text-red-700">Needs Work</div>
            <div className="text-xs text-red-600">{analytics.worstDay}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-4">
        Generated on {new Date().toLocaleDateString()}
      </div>
    </div>
  );
} 