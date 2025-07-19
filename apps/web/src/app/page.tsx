"use client";

import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import Header from "@/components/Header";
import Benefits from "@/components/home/Benefits";
import Footer from "@/components/home/Footer";
import FooterHero from "@/components/home/FooterHero";
import Hero from "@/components/home/Hero";
import Testimonials from "@/components/home/Testimonials";
import { Button } from "@/components/common/button";
import { BookOpen, Calendar, TrendingUp, Clock, Plus, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

// Dashboard component for logged-in users
const Dashboard = () => {
  const { user } = useUser();
  const notes = useQuery(api.notes.getNotes);
  const habits = useQuery(api.habits.list);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toLocaleDateString('en-CA');
  
  // Get today's notes
  const todaysNotes = notes?.filter(note => note.date === today) || [];
  
  // Get recent notes (including today's, up to 5 total)
  const recentNotes = notes?.slice(0, 5) || [];

  // Get dashboard data for habits
  const dashboardData = useQuery(api.habits.getDashboard);
  const habitsWithStatus = dashboardData?.habits || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.firstName || 'there'}!</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your AI-powered journal and habit tracker to help you organize your thoughts and build better habits.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Entries</p>
                <p className="text-2xl font-bold text-gray-900">{todaysNotes.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Habits</p>
                <p className="text-2xl font-bold text-green-600">{dashboardData?.totalHabits || 0}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-purple-600">{dashboardData?.completedToday || 0}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Button asChild size="lg" className="h-32 flex-col gap-3 bg-white hover:bg-gray-50 border-2 border-gray-100">
            <Link href="/notes">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-lg font-semibold">Daily Journal</span>
              <span className="text-sm text-gray-600">Write today's entry</span>
            </Link>
          </Button>
          
          <Button asChild size="lg" className="h-32 flex-col gap-3 bg-white hover:bg-gray-50 border-2 border-gray-100">
            <Link href="/habits">
              <Calendar className="w-8 h-8 text-green-600" />
              <span className="text-lg font-semibold">Habit Tracker</span>
              <span className="text-sm text-gray-600">Track your progress</span>
            </Link>
          </Button>
          
          <Button asChild size="lg" className="h-32 flex-col gap-3 bg-white hover:bg-gray-50 border-2 border-gray-100">
            <Link href="/notes">
              <Plus className="w-8 h-8 text-purple-600" />
              <span className="text-lg font-semibold">New Entry</span>
              <span className="text-sm text-gray-600">Create journal entry</span>
            </Link>
          </Button>
          
          <Button asChild size="lg" className="h-32 flex-col gap-3 bg-white hover:bg-gray-50 border-2 border-gray-100">
            <Link href="/habits">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-lg font-semibold">Analytics</span>
              <span className="text-sm text-gray-600">View insights</span>
            </Link>
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Journal Entries</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/notes" className="flex items-center gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <div key={note._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{note.title}</p>
                      <p className="text-sm text-gray-600">{formatDate(note.date)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No journal entries yet</p>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href="/notes">Create your first entry</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Today's Habits</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/habits" className="flex items-center gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {habitsWithStatus.length > 0 ? (
                habitsWithStatus.slice(0, 3).map((habit) => (
                  <div key={habit._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">{habit.title}</span>
                    </div>
                    <span className={`text-sm font-medium ${habit.todayCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {habit.todayCompleted ? '✓ Completed' : 'Pending'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No habits created yet</p>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href="/habits">Create your first habit</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">💡 Quick Tip</h3>
          <p className="text-lg mb-4">
            {recentNotes.length === 0 
              ? "Start your journaling journey today! Even just 5 minutes of reflection can make a big difference."
              : "Great job keeping up with your journal! Try adding a habit tracker to build consistency in other areas of your life."
            }
          </p>
          <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            <Link href={recentNotes.length === 0 ? "/notes" : "/habits"}>
              {recentNotes.length === 0 ? "Start Journaling Now" : "Try Habit Tracking"}
            </Link>
          </Button>
        </div>


      </div>
    </div>
  );
};

export default function Home() {
  const { user, isLoaded } = useUser();

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <main>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      {user ? (
        // Show dashboard for logged-in users
        <Dashboard />
      ) : (
        // Show landing page for non-logged-in users
        <>
          <Hero />
          <Benefits />
          <Testimonials />
          <FooterHero />
        </>
      )}
      <Footer />
    </main>
  );
}
