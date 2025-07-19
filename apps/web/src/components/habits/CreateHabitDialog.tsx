"use client";

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Button } from "@/components/common/button";
import { X, Plus, Target, Palette, Calendar, FileText } from "lucide-react";

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const frequencyOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const colorOptions = [
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "red", label: "Red", color: "bg-red-500" },
];

const categoryOptions = [
  "Health & Fitness",
  "Productivity",
  "Learning",
  "Mindfulness",
  "Social",
  "Finance",
  "Other",
];

export function CreateHabitDialog({ open, onOpenChange }: CreateHabitDialogProps) {
  const createHabit = useMutation(api.habits.create);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    frequency: "daily",
    targetCount: "",
    color: "blue",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createHabit({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category || undefined,
        frequency: formData.frequency,
        targetCount: formData.targetCount ? parseInt(formData.targetCount) : undefined,
        color: formData.color,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        frequency: "daily",
        targetCount: "",
        color: "blue",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create habit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelButtonRef = useRef(null);

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Plus className="w-6 h-6 text-blue-600" />
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                      Create New Habit
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Habit Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Drink 8 glasses of water"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a description to help you remember..."
                        rows={3}
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category (optional)
                      </label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a category</option>
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Frequency */}
                    <div>
                      <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency *
                      </label>
                      <select
                        id="frequency"
                        required
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {frequencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Count */}
                    <div>
                      <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700 mb-1">
                        Target Count (optional)
                      </label>
                      <input
                        type="number"
                        id="targetCount"
                        min="1"
                        value={formData.targetCount}
                        onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 8 for glasses of water"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty for simple yes/no habits
                      </p>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Theme
                      </label>
                      <div className="flex gap-2">
                        {colorOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: option.value })}
                            className={`w-8 h-8 rounded-full border-2 ${
                              formData.color === option.value
                                ? 'border-gray-900'
                                : 'border-gray-300'
                            } ${option.color}`}
                            title={option.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                        disabled={isLoading}
                        ref={cancelButtonRef}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading || !formData.title.trim()}
                      >
                        {isLoading ? "Creating..." : "Create Habit"}
                      </Button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 