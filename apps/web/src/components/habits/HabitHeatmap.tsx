"use client";

import React, { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Button } from "@/components/common/button";
import { X, CheckCircle, Circle, Calendar, Edit3 } from "lucide-react";

interface DayEditDialogProps {
  date: string;
  habits: any[];
  entries: any[];
  onClose: () => void;
  onSave: (updates: { habitId: string; completed: boolean }[]) => void;
  isVisible: boolean;
}

function DayEditDialog({ date, habits, entries, onClose, onSave, isVisible }: DayEditDialogProps) {
  const [updates, setUpdates] = useState<{ habitId: string; completed: boolean; count: number }[]>(() => {
    // Initialize with current completion status and count
    return habits.map(habit => {
      const entry = entries.find(e => e.habitId === habit._id);
      return {
        habitId: habit._id,
        completed: entry?.completed || false,
        count: entry?.count || 0
      };
    });
  });
  const cancelButtonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Update isOpen when isVisible changes
  React.useEffect(() => {
    if (isVisible) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isVisible]);

  // Update updates when date or entries change
  React.useEffect(() => {
    if (date && entries.length > 0) {
      setUpdates(habits.map(habit => {
        const entry = entries.find(e => e.habitId === habit._id);
        return {
          habitId: habit._id,
          completed: entry?.completed || false,
          count: entry?.count || 0
        };
      }));
    }
  }, [date, entries, habits]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => onClose(), 200); // Wait for transition to complete
  };

  const handleToggle = (habitId: string) => {
    setUpdates(prev => prev.map(update => 
      update.habitId === habitId 
        ? { ...update, completed: !update.completed, count: !update.completed ? 1 : 0 }
        : update
    ));
  };

  const handleIncrement = (habitId: string) => {
    setUpdates(prev => prev.map(update => {
      if (update.habitId === habitId) {
        const habit = habits.find(h => h._id === habitId);
        const newCount = Math.min(update.count + 1, habit?.targetCount || 1);
        return { 
          ...update, 
          count: newCount,
          completed: newCount >= (habit?.targetCount || 1)
        };
      }
      return update;
    }));
  };

  const handleDecrement = (habitId: string) => {
    setUpdates(prev => prev.map(update => {
      if (update.habitId === habitId) {
        const newCount = Math.max(update.count - 1, 0);
        const habit = habits.find(h => h._id === habitId);
        return { 
          ...update, 
          count: newCount,
          completed: newCount >= (habit?.targetCount || 1)
        };
      }
      return update;
    }));
  };

  const handleSave = () => {
    onSave(updates);
    handleClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[60]"
        initialFocus={cancelButtonRef}
        onClose={handleClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-[60] w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-2 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                      Edit {formatDate(date)}
                    </Dialog.Title>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {habits.map(habit => {
                      const update = updates.find(u => u.habitId === habit._id);
                      const hasTargetCount = habit.targetCount && habit.targetCount > 1;
                      
                      return (
                        <div key={habit._id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{habit.title}</span>
                            {!hasTargetCount && (
                              <Button
                                variant={update?.completed ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleToggle(habit._id)}
                                className={`flex items-center gap-2 ${
                                  update?.completed 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'hover:bg-green-50 hover:border-green-300'
                                }`}
                              >
                                {update?.completed ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                                {update?.completed ? 'Done' : 'Mark Done'}
                              </Button>
                            )}
                          </div>
                          
                          {hasTargetCount && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDecrement(habit._id)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 bg-white text-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                  disabled={update?.count <= 0}
                                  type="button"
                                >
                                  –
                                </button>
                                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                                  {update?.count || 0}/{habit.targetCount}
                                </span>
                                <button
                                  onClick={() => handleIncrement(habit._id)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 bg-white text-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                  disabled={(update?.count || 0) >= habit.targetCount}
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                              <div className="flex gap-1">
                                {Array.from({ length: habit.targetCount }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < (update?.count || 0) ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={handleClose} 
                    className="flex-1"
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="flex-1 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export function HabitHeatmap() {
  const data = useQuery(api.habits.getHeatmapData) || [];
  const habits = useQuery(api.habits.list) || [];
  const markCompleted = useMutation(api.habits.markCompleted);
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: string }>({
    show: false,
    x: 0,
    y: 0,
    content: "",
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const selectedDayEntries = useQuery(
    selectedDay ? api.habits.getEntriesForDate : "skip",
    selectedDay ? { date: selectedDay } : "skip"
  );

  if (!data.length) return null;

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(dateStr);
  };

  const handleSaveDay = async (updates: { habitId: string; completed: boolean; count: number }[]) => {
    if (!selectedDay) return;
    
    for (const update of updates) {
      await markCompleted({
        habitId: update.habitId as any,
        date: selectedDay,
        completed: update.completed,
        count: update.count > 0 ? update.count : undefined,
      });
    }
    setSelectedDay(null);
  };

  // Create a map for quick lookup
  const dataMap = new Map(data.map(d => [d.date, d]));

  // Calculate how many weeks can fit in the container
  // Assuming container width is ~800px, each week is ~16px (square) + 2px (gap) = 18px
  // Leave space for day labels (~40px) and margins
  const maxWeeks = Math.floor((800 - 60) / 18); // ~41 weeks max
  
  // Generate days for the maximum number of weeks that can fit
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { date: string; completed: number; total: number }[] = [];
  
  for (let i = (maxWeeks * 7) - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
    
    const entry = dataMap.get(dateStr) || { completed: 0, total: 0 };
    days.push({ date: dateStr, ...entry });
  }

  // Group days into weeks (7 columns)
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Calculate color intensity based on completion rate
  const getColor = (completed: number, total: number) => {
    if (total === 0) return "bg-gray-100"; // No habits on this day
    const rate = completed / total;
    if (rate === 0) return "bg-gray-100"; // No completions
    if (rate < 0.25) return "bg-green-200";
    if (rate < 0.5) return "bg-green-300";
    if (rate < 0.75) return "bg-green-400";
    return "bg-green-500"; // 75%+ completion
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get month labels for the top
  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    let currentMonth = "";
    
    weeks.forEach((week, weekIndex) => {
      const firstDay = new Date(week[0].date + 'T00:00:00');
      const month = firstDay.toLocaleDateString(undefined, { month: 'short' });
      
      if (month !== currentMonth) {
        labels.push({ month, weekIndex });
        currentMonth = month;
      }
    });
    
    return labels;
  };

  const monthLabels = getMonthLabels();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Habit Completion Heatmap</h2>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-gray-600">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
        </div>
        <span className="text-sm text-gray-600">More</span>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex flex-col gap-2">
          {/* Month labels */}
          <div className="flex gap-0.5 ml-6">
            {monthLabels.map((label, index) => {
              const startWeek = label.weekIndex;
              const endWeek = index < monthLabels.length - 1 ? monthLabels[index + 1].weekIndex : weeks.length;
              const weekCount = endWeek - startWeek;
              
              return (
                <div
                  key={index}
                  className="text-xs text-gray-500 font-medium"
                  style={{
                    width: `${weekCount * 16}px`,
                    minWidth: '16px'
                  }}
                >
                  {label.month}
                </div>
              );
            })}
          </div>
          
          {/* Heatmap with day labels */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {dayLabels.map((day, index) => (
                <div key={index} className="h-4 text-xs text-gray-500 font-medium flex items-center">
                  {index % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((day, dayIndex) => {
                    const color = getColor(day.completed, day.total);
                    const tooltipContent = day.total > 0 
                      ? `${formatDate(day.date)}\n${day.completed}/${day.total} habits completed`
                      : `${formatDate(day.date)}\nNo habits tracked`;
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-4 h-4 ${color} rounded-sm cursor-pointer hover:ring-1 hover:ring-gray-300 transition-all`}
                        onClick={() => handleDayClick(day.date)}
                        onMouseEnter={(e) => {
                          setTooltip({
                            show: true,
                            x: e.clientX,
                            y: e.clientY,
                            content: tooltipContent,
                          });
                        }}
                        onMouseLeave={() => setTooltip({ show: false, x: 0, y: 0, content: "" })}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none whitespace-pre-line"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          {tooltip.content}
        </div>
      )}

      <DayEditDialog
        date={selectedDay || ""}
        habits={habits}
        entries={selectedDayEntries || []}
        onClose={() => setSelectedDay(null)}
        onSave={handleSaveDay}
        isVisible={!!selectedDay && !!selectedDayEntries}
      />
    </div>
  );
} 