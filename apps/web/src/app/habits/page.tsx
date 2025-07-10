"use client";

import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Button } from "@/components/common/button";
import { Plus, CheckCircle, Circle, TrendingUp } from "lucide-react";
import { useState } from "react";
import { CreateHabitDialog, HabitCard } from "@/components/habits";
import Header from "@/components/Header";

export default function HabitsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const dashboard = useQuery(api.habits.getDashboard);

  if (!dashboard) {
    return (
      <main className="bg-gray-50 min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  const { habits, totalHabits, completedToday } = dashboard;

  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
            <p className="text-gray-600 mt-2">
              Track your daily habits and build lasting routines
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Habits</p>
                <p className="text-2xl font-bold text-gray-900">{totalHabits}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{completedToday}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining Today</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalHabits - completedToday}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Circle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No habits yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first habit to start building better routines
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Your First Habit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <HabitCard key={habit._id} habit={habit} />
            ))}
          </div>
        )}
      </div>

      <CreateHabitDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </main>
  );
} 