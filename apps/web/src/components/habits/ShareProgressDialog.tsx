"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/common/button";
import { Download, Share2, X } from "lucide-react";
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
      
      onClose();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToSocial = async () => {
    setIsGenerating(true);
    try {
      // Create canvas manually (same as generateImage)
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
      
      // Create blob and share
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/png");
      });
      
      const file = new File([blob], "habit-progress.png", { type: "image/png" });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Habit Progress",
          text: "Check out my habit tracking progress!",
          files: [file],
        });
      } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `habit-progress-${new Date().toISOString().split('T')[0]}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      onClose();
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Share Your Progress</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Customization Options */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customize Your Share</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeStreak}
                  onChange={(e) => setIncludeStreak(e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Include current streak</label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeChart}
                  onChange={(e) => setIncludeChart(e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Include weekly chart</label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm text-gray-700">Include completion stats</label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="border rounded-lg p-4 bg-gray-50 flex justify-center">
              <div ref={shareableRef} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', width: "400px", height: "600px" }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(to right, #4ade80, #3b82f6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}>
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>H</span>
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Habit Tracker</h1>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    {user?.firstName ? `${user.firstName}'s Progress Report` : 'My Progress Report'}
                  </p>
                </div>

                {/* Streak */}
                {includeStreak && (
                  <div style={{ background: 'linear-gradient(to right, #4ade80, #3b82f6)', borderRadius: '8px', padding: '16px', marginBottom: '16px', textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      🔥 {analytics.currentStreak} Day Streak
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                      {analytics.currentStreak > 0 ? "Keep it up!" : "Start building your streak!"}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {includeStats && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
                        {Math.round(analytics.overallCompletionRate)}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Completion Rate</div>
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                        {analytics.totalHabits}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Active Habits</div>
                    </div>
                  </div>
                )}

                {/* Chart */}
                {includeChart && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '8px' }}>Last 7 Days</h3>
                    <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', height: '80px' }}>
                      {last7Days.map((completions, index) => (
                        <div
                          key={index}
                          style={{ 
                            backgroundColor: '#4ade80', 
                            borderTopLeftRadius: '4px', 
                            borderTopRightRadius: '4px', 
                            width: '24px',
                            height: `${(completions / maxCompletions) * 100}%` 
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {dayLabels.map((day, index) => (
                        <span key={index}>{day}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Best/Worst Day */}
                {includeStats && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#15803d' }}>Best Day</div>
                      <div style={{ fontSize: '12px', color: '#16a34a' }}>{analytics.bestDay}</div>
                    </div>
                    <div style={{ backgroundColor: '#fef2f2', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#dc2626' }}>Needs Work</div>
                      <div style={{ fontSize: '12px', color: '#dc2626' }}>{analytics.worstDay}</div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '16px' }}>
                  Generated on {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={generateImage}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              <Download size={16} />
              <span>{isGenerating ? "Generating..." : "Download Image"}</span>
            </Button>
            
            <Button
              onClick={shareToSocial}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              <Share2 size={16} />
              <span>{isGenerating ? "Sharing..." : "Share"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 