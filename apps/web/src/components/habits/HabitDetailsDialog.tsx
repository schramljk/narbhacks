"use client";

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Button } from "@/components/common/button";
import { X, Trash2, Edit, Calendar, Target, TrendingUp, Info } from "lucide-react";
import { EditHabitDialog } from "./EditHabitDialog";
import { HabitStreak } from "./HabitStreak";

interface HabitDetailsDialogProps {
  habitId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HabitDetailsDialog({ habitId, open, onOpenChange }: HabitDetailsDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const habitData = useQuery(api.habits.get, { habitId: habitId as any });
  const stats = useQuery(api.habits.getStats, { habitId: habitId as any });
  const deleteHabit = useMutation(api.habits.remove);
  const cancelButtonRef = useRef(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this habit? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteHabit({ habitId: habitId as any });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete habit:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!habitData) return null;

  const { habit, entries } = habitData;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[60]"
        initialFocus={cancelButtonRef}
        onClose={() => onOpenChange(false)}
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-blue-600" />
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                      {habit.title}
                    </Dialog.Title>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Habit Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        {habit.description && (
                          <p><strong>Description:</strong> {habit.description}</p>
                        )}
                        {habit.category && (
                          <p><strong>Category:</strong> {habit.category}</p>
                        )}
                        <p><strong>Frequency:</strong> {habit.frequency}</p>
                        {habit.targetCount && (
                          <p><strong>Target:</strong> {habit.targetCount}</p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Statistics</h3>
                      {stats ? (
                        <div className="space-y-2 text-sm">
                          <HabitStreak habitId={habitId} />
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-600" />
                            <span><strong>Completion Rate:</strong> {stats.completionRate}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span><strong>Total Entries:</strong> {stats.totalEntries}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Loading statistics...</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Entries */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Recent Entries</h3>
                    {entries.length === 0 ? (
                      <p className="text-gray-500 text-sm">No entries yet. Start tracking your habit!</p>
                    ) : (
                      <div className="space-y-2">
                        {entries.slice(0, 7).map((entry) => (
                          <div
                            key={entry._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                              {entry.completed ? (
                                <span className="text-green-600 text-sm">✓ Completed</span>
                              ) : (
                                <span className="text-red-600 text-sm">✗ Missed</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {habit.targetCount && entry.count && `${entry.count}/${habit.targetCount}`}
                              {entry.notes && <span className="ml-2">- {entry.notes}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                    ref={cancelButtonRef}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {habitData && (
          <EditHabitDialog
            habit={habitData.habit}
            isOpen={showEditDialog}
            onClose={() => setShowEditDialog(false)}
          />
        )}
      </Dialog>
    </Transition.Root>
  );
} 