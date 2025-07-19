"use client";

import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

interface HabitStreakProps {
  habitId: string;
  compact?: boolean;
}

export function HabitStreak({ habitId, compact = false }: HabitStreakProps) {
  const stats = useQuery(api.habits.getStats, { habitId: habitId as any });

  if (!stats) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-orange-500">🔥</span>
        <span className="font-medium">{stats.currentStreak}</span>
        {stats.longestStreak > stats.currentStreak && (
          <span className="text-gray-400 text-xs">
            (best: {stats.longestStreak})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <span className="text-orange-500">🔥</span>
        <span className="font-medium">Current: {stats.currentStreak}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-yellow-500">🏆</span>
        <span className="font-medium">Best: {stats.longestStreak}</span>
      </div>
    </div>
  );
} 