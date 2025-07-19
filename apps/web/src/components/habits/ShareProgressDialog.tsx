"use client";

import { Fragment, useState, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/common/button";
import { Download, Share2, X, BarChart3, TrendingUp, Target } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

interface ShareProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareProgressDialog({ isOpen, onClose }: ShareProgressDialogProps) {
  const [includeStreak, setIncludeStreak] = useState(true);
  const [includeChart, setIncludeChart] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const shareableRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef(null);
  const { user } = useUser();

  // Get real data
  const analytics = useQuery(api.habits.getAnalytics) || {
    overallCompletionRate: 0,
    recentCompletionRate: 0,
    bestDay: "Monday",
    worstDay: "Sunday",
    totalHabits: 0,
    currentStreak: 0,
    longestStreak: 0
  };
  const completionHistory = useQuery(api.habits.getCompletionHistory) || [];

  // Build last 7 days data with correct day labels
  const last7Days = [];
  const dayLabels = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
    
    const found = completionHistory.find(entry => entry.date === dateStr);
    last7Days.push(found ? found.completed : 0);
    
    // Get the day name
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.push(dayNames[d.getDay()]);
  }

  const maxCompletions = Math.max(...last7Days, 1); // Avoid division by zero

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      // Create canvas manually
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Set canvas size
      canvas.width = 800; // 2x scale for quality
      canvas.height = 1200;
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Header
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Habit Tracker', canvas.width / 2, 80);
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '28px Arial';
      ctx.fillText(`${user?.firstName ? `${user.firstName}'s Progress Report` : 'My Progress Report'}`, canvas.width / 2, 120);
      
      // Streak
      if (includeStreak) {
        const gradient = ctx.createLinearGradient(100, 160, 700, 160);
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(1, '#3b82f6');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(100, 160, 600, 80);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`🔥 ${analytics.currentStreak} Day Streak`, canvas.width / 2, 200);
        
        ctx.font = '24px Arial';
        ctx.fillText(analytics.currentStreak > 0 ? "Keep it up!" : "Start building your streak!", canvas.width / 2, 230);
      }
      
      let yOffset = includeStreak ? 280 : 200;
      
      // Stats
      if (includeStats) {
        // Completion Rate
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(100, yOffset, 280, 80);
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(analytics.overallCompletionRate)}%`, 240, yOffset + 50);
        ctx.fillStyle = '#6b7280';
        ctx.font = '20px Arial';
        ctx.fillText('Completion Rate', 240, yOffset + 75);
        
        // Active Habits
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(420, yOffset, 280, 80);
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`${analytics.totalHabits}`, 560, yOffset + 50);
        ctx.fillStyle = '#6b7280';
        ctx.font = '20px Arial';
        ctx.fillText('Active Habits', 560, yOffset + 75);
        
        yOffset += 120;
      }
      
      // Chart
      if (includeChart) {
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Last 7 Days', 100, yOffset);
        
        const chartWidth = 600;
        const chartHeight = 160;
        const barWidth = chartWidth / 7;
        const maxHeight = Math.max(...last7Days, 1);
        
        for (let i = 0; i < 7; i++) {
          const barHeight = (last7Days[i] / maxHeight) * chartHeight;
          const x = 100 + (i * barWidth) + (barWidth * 0.1);
          const y = yOffset + 40 + (chartHeight - barHeight);
          
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x, y, barWidth * 0.8, barHeight);
        }
        
        // Day labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i < 7; i++) {
          const x = 100 + (i * barWidth) + (barWidth / 2);
          const y = yOffset + 40 + chartHeight + 30;
          ctx.fillText(dayLabels[i], x, y);
        }
        
        yOffset += 240;
      }
      
      // Best/Worst Day
      if (includeStats) {
        // Best Day
        ctx.fillStyle = '#f0fdf4';
        ctx.fillRect(100, yOffset, 280, 60);
        ctx.fillStyle = '#15803d';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Best Day', 240, yOffset + 35);
        ctx.fillStyle = '#16a34a';
        ctx.font = '20px Arial';
        ctx.fillText(analytics.bestDay, 240, yOffset + 55);
        
        // Worst Day
        ctx.fillStyle = '#fef2f2';
        ctx.fillRect(420, yOffset, 280, 60);
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Needs Work', 560, yOffset + 35);
        ctx.font = '20px Arial';
        ctx.fillText(analytics.worstDay, 560, yOffset + 55);
        
        yOffset += 100;
      }
      
      // Footer
      ctx.fillStyle = '#6b7280';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, yOffset + 40);
      
      // Download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `habit-progress-${new Date().toISOString().split('T')[0]}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToSocial = async () => {
    setIsGenerating(true);
    try {
      // Generate the image first
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Set canvas size
      canvas.width = 800;
      canvas.height = 1200;
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Header
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Habit Tracker', canvas.width / 2, 80);
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '28px Arial';
      ctx.fillText(`${user?.firstName ? `${user.firstName}'s Progress Report` : 'My Progress Report'}`, canvas.width / 2, 120);
      
      // Streak
      if (includeStreak) {
        const gradient = ctx.createLinearGradient(100, 160, 700, 160);
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(1, '#3b82f6');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(100, 160, 600, 80);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`🔥 ${analytics.currentStreak} Day Streak`, canvas.width / 2, 200);
        
        ctx.font = '24px Arial';
        ctx.fillText(analytics.currentStreak > 0 ? "Keep it up!" : "Start building your streak!", canvas.width / 2, 230);
      }
      
      let yOffset = includeStreak ? 280 : 200;
      
      // Stats
      if (includeStats) {
        // Completion Rate
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(100, yOffset, 280, 80);
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(analytics.overallCompletionRate)}%`, 240, yOffset + 50);
        ctx.fillStyle = '#6b7280';
        ctx.font = '20px Arial';
        ctx.fillText('Completion Rate', 240, yOffset + 75);
        
        // Active Habits
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(420, yOffset, 280, 80);
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(`${analytics.totalHabits}`, 560, yOffset + 50);
        ctx.fillStyle = '#6b7280';
        ctx.font = '20px Arial';
        ctx.fillText('Active Habits', 560, yOffset + 75);
        
        yOffset += 120;
      }
      
      // Chart
      if (includeChart) {
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Last 7 Days', 100, yOffset);
        
        const chartWidth = 600;
        const chartHeight = 160;
        const barWidth = chartWidth / 7;
        const maxHeight = Math.max(...last7Days, 1);
        
        for (let i = 0; i < 7; i++) {
          const barHeight = (last7Days[i] / maxHeight) * chartHeight;
          const x = 100 + (i * barWidth) + (barWidth * 0.1);
          const y = yOffset + 40 + (chartHeight - barHeight);
          
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x, y, barWidth * 0.8, barHeight);
        }
        
        // Day labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i < 7; i++) {
          const x = 100 + (i * barWidth) + (barWidth / 2);
          const y = yOffset + 40 + chartHeight + 30;
          ctx.fillText(dayLabels[i], x, y);
        }
        
        yOffset += 240;
      }
      
      // Best/Worst Day
      if (includeStats) {
        // Best Day
        ctx.fillStyle = '#f0fdf4';
        ctx.fillRect(100, yOffset, 280, 60);
        ctx.fillStyle = '#15803d';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Best Day', 240, yOffset + 35);
        ctx.fillStyle = '#16a34a';
        ctx.font = '20px Arial';
        ctx.fillText(analytics.bestDay, 240, yOffset + 55);
        
        // Worst Day
        ctx.fillStyle = '#fef2f2';
        ctx.fillRect(420, yOffset, 280, 60);
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Needs Work', 560, yOffset + 35);
        ctx.font = '20px Arial';
        ctx.fillText(analytics.worstDay, 560, yOffset + 55);
        
        yOffset += 100;
      }
      
      // Footer
      ctx.fillStyle = '#6b7280';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, yOffset + 40);
      
      // Convert to blob and share
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `habit-progress-${new Date().toISOString().split('T')[0]}.png`, { type: 'image/png' });
          
          try {
            await navigator.share({
              title: 'My Habit Progress',
              text: `Check out my habit tracking progress! 🔥 ${analytics.currentStreak} day streak and ${Math.round(analytics.overallCompletionRate)}% completion rate.`,
              files: [file]
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        } else {
          // Fallback to download if sharing is not supported
          const image = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `habit-progress-${new Date().toISOString().split('T')[0]}.png`;
          link.href = image;
          link.click();
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[60]"
        initialFocus={cancelButtonRef}
        onClose={onClose}
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
                    <Share2 className="w-6 h-6 text-blue-600" />
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                      Share Progress
                    </Dialog.Title>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Options */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Include in your progress report:</h4>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={includeStreak}
                            onChange={(e) => setIncludeStreak(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">Current Streak</span>
                          </div>
                        </label>
                        
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={includeStats}
                            onChange={(e) => setIncludeStats(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Statistics & Metrics</span>
                          </div>
                        </label>
                        
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={includeChart}
                            onChange={(e) => setIncludeChart(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">7-Day Chart</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Preview:</h4>
                      <div 
                        ref={shareableRef}
                        className="bg-white rounded-lg p-4 border max-h-64 overflow-y-auto"
                      >
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-gray-900">Habit Tracker</h3>
                          <p className="text-sm text-gray-600">
                            {user?.firstName ? `${user.firstName}'s Progress Report` : 'My Progress Report'}
                          </p>
                        </div>
                        
                        {includeStreak && (
                          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-3 mb-3 text-center">
                            <div className="text-xl font-bold">🔥 {analytics.currentStreak} Day Streak</div>
                            <div className="text-sm">
                              {analytics.currentStreak > 0 ? "Keep it up!" : "Start building your streak!"}
                            </div>
                          </div>
                        )}
                        
                        {includeStats && (
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-gray-100 rounded-lg p-2 text-center">
                              <div className="text-lg font-bold text-green-600">{Math.round(analytics.overallCompletionRate)}%</div>
                              <div className="text-xs text-gray-600">Completion Rate</div>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-2 text-center">
                              <div className="text-lg font-bold text-blue-600">{analytics.totalHabits}</div>
                              <div className="text-xs text-gray-600">Active Habits</div>
                            </div>
                          </div>
                        )}
                        
                        {includeChart && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-900">Last 7 Days</div>
                            <div className="flex items-end gap-1 h-16">
                              {last7Days.map((count, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-green-500 rounded-t"
                                  style={{
                                    height: `${(count / maxCompletions) * 100}%`,
                                    minHeight: count > 0 ? '4px' : '0'
                                  }}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              {dayLabels.map((day, i) => (
                                <span key={i}>{day}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {includeStats && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="bg-green-50 rounded-lg p-2 text-center">
                              <div className="text-xs font-medium text-green-800">Best Day</div>
                              <div className="text-sm text-green-600">{analytics.bestDay}</div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-2 text-center">
                              <div className="text-xs font-medium text-red-800">Needs Work</div>
                              <div className="text-sm text-red-600">{analytics.worstDay}</div>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-center text-xs text-gray-500 mt-3">
                          Generated on {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateImage}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isGenerating ? "Generating..." : "Download"}
                  </Button>
                  <Button
                    type="button"
                    onClick={shareToSocial}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    {isGenerating ? "Sharing..." : "Share"}
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