"use client";

import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Button } from "@/components/common/button";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface EditHabitDialogProps {
  habit: {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    frequency: string;
    targetCount?: number;
    color?: string;
  };
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

export function EditHabitDialog({ habit, open, onOpenChange }: EditHabitDialogProps) {
  const updateHabit = useMutation(api.habits.update);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    frequency: "daily",
    targetCount: "",
    color: "blue",
  });

  // Initialize form data when habit changes
  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title,
        description: habit.description || "",
        category: habit.category || "",
        frequency: habit.frequency,
        targetCount: habit.targetCount?.toString() || "",
        color: habit.color || "blue",
      });
    }
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateHabit({
        habitId: habit._id as any,
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category || undefined,
        frequency: formData.frequency,
        targetCount: formData.targetCount ? parseInt(formData.targetCount) : undefined,
        color: formData.color,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update habit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Habit</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? "Updating..." : "Update Habit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 