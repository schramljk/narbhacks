"use client";

import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Button } from "@/components/common/button";
import { Plus, CheckCircle, Circle, TrendingUp, Share2 } from "lucide-react";
import { useState } from "react";
import { CreateHabitDialog, HabitCard, ShareProgressDialog } from "@/components/habits";
import Header from "@/components/Header";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { HabitCompletionGraph } from "@/components/habits/HabitCompletionGraph";
import { HabitAnalytics } from "@/components/habits/HabitAnalytics";
import { HabitHeatmap } from "@/components/habits/HabitHeatmap";

export default function HabitsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const dashboard = useQuery(api.habits.getDashboard);
  const analytics = useQuery(api.habits.getAnalytics);

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
      <SignedIn>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
                {analytics && analytics.currentStreak > 0 && (
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    🔥 {analytics.currentStreak} Day Streak
                  </div>
                )}
              </div>
              <p className="text-gray-600">
                Track your daily habits and build lasting routines
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowShareDialog(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Progress
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Habit
              </Button>
            </div>
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

          <div className="mt-12">
            <HabitAnalytics />
            <HabitCompletionGraph />
            <HabitHeatmap />
          </div>

          <CreateHabitDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
          />
          
          <ShareProgressDialog
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
          />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="mb-4 text-lg">Please sign in to view your habits.</p>
          <SignInButton />
        </div>
      </SignedOut>
    </main>
  );
} 