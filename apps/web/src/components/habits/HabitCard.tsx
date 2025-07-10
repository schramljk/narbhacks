"use client";

import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { CheckCircle, Circle, MoreVertical, Target } from "lucide-react";
import { Button } from "@/components/common/button";
import { useState } from "react";
import { HabitDetailsDialog } from "./HabitDetailsDialog";

interface HabitCardProps {
  habit: {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    frequency: string;
    targetCount?: number;
    color?: string;
    todayCompleted: boolean;
    todayCount: number;
  };
}

export function HabitCard({ habit }: HabitCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const markCompleted = useMutation(api.habits.markCompleted);
  const today = new Date().toISOString().split('T')[0];

  const handleToggle = async () => {
    await markCompleted({
      habitId: habit._id as any,
      date: today,
      completed: !habit.todayCompleted,
      count: habit.targetCount ? (habit.todayCompleted ? 0 : 1) : undefined,
    });
  };

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 border-blue-200';
      case 'green': return 'bg-green-50 border-green-200';
      case 'purple': return 'bg-purple-50 border-purple-200';
      case 'orange': return 'bg-orange-50 border-orange-200';
      case 'red': return 'bg-red-50 border-red-200';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <>
      <div className={`rounded-lg border p-6 shadow-sm transition-all hover:shadow-md ${getColorClasses(habit.color)}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{habit.title}</h3>
            {habit.description && (
              <p className="text-sm text-gray-600 mb-2">{habit.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {habit.category && (
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  {habit.category}
                </span>
              )}
              <span className="capitalize">{habit.frequency}</span>
              {habit.targetCount && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>{habit.targetCount}</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {habit.targetCount ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {habit.todayCount}/{habit.targetCount}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: habit.targetCount }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < habit.todayCount ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-600">
                {habit.todayCompleted ? 'Completed today' : 'Not completed today'}
              </span>
            )}
          </div>

          <Button
            onClick={handleToggle}
            variant={habit.todayCompleted ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 ${
              habit.todayCompleted 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'hover:bg-green-50 hover:border-green-300'
            }`}
          >
            {habit.todayCompleted ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            {habit.todayCompleted ? 'Done' : 'Mark Done'}
          </Button>
        </div>
      </div>

      <HabitDetailsDialog
        habitId={habit._id}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
} 