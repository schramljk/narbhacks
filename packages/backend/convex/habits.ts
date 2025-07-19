import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new habit
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    frequency: v.string(),
    targetCount: v.optional(v.number()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const now = Date.now();

    const habitId = await ctx.db.insert("habits", {
      userId,
      title: args.title,
      description: args.description,
      category: args.category,
      frequency: args.frequency,
      targetCount: args.targetCount,
      color: args.color,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return habitId;
  },
});

// Get all habits for a user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return habits;
  },
});

// Get a single habit with its entries
export const get = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("Habit not found");
    }

    // Get recent entries for this habit
    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) => q.eq("habitId", args.habitId))
      .order("desc")
      .take(30); // Last 30 entries

    return { habit, entries };
  },
});

// Update a habit
export const update = mutation({
  args: {
    habitId: v.id("habits"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    frequency: v.optional(v.string()),
    targetCount: v.optional(v.number()),
    color: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { habitId, ...updates } = args;
    await ctx.db.patch(habitId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a habit
export const remove = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Delete the habit
    await ctx.db.delete(args.habitId);

    // Delete all entries for this habit
    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) => q.eq("habitId", args.habitId))
      .collect();

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    // Delete all reminders for this habit
    const reminders = await ctx.db
      .query("habitReminders")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .collect();

    for (const reminder of reminders) {
      await ctx.db.delete(reminder._id);
    }
  },
});

// Mark a habit as completed for a specific date
export const markCompleted = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(),
    completed: v.boolean(),
    count: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Check if entry already exists for this date
    const existingEntry = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) => 
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .first();

    if (existingEntry) {
      // Update existing entry
      await ctx.db.patch(existingEntry._id, {
        completed: args.completed,
        count: args.count,
        notes: args.notes,
      });
    } else {
      // Create new entry
      await ctx.db.insert("habitEntries", {
        habitId: args.habitId,
        userId,
        date: args.date,
        completed: args.completed,
        count: args.count,
        notes: args.notes,
        createdAt: Date.now(),
      });
    }
  },
});

// Get habit statistics including current streak
export const getStats = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) => q.eq("habitId", args.habitId))
      .order("desc")
      .collect();

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedEntries = entries.sort((a, b) => b.date.localeCompare(a.date));

    for (const entry of sortedEntries) {
      if (entry.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const entry of sortedEntries) {
      if (entry.completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate total completion rate
    const totalEntries = entries.length;
    const completedEntries = entries.filter(e => e.completed).length;
    const completionRate = totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0;

    return {
      currentStreak,
      longestStreak,
      totalEntries,
      completedEntries,
      completionRate: Math.round(completionRate),
      entries: sortedEntries.slice(0, 7), // Last 7 entries
    };
  },
});

// Get dashboard data for all habits
export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const today = new Date().toISOString().split('T')[0];

    // Get all active habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get today's entries for all habits
    const todayEntries = await ctx.db
      .query("habitEntries")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", userId).eq("date", today)
      )
      .collect();

    // Create a map of habitId to today's entry
    const todayEntriesMap = new Map();
    todayEntries.forEach(entry => {
      todayEntriesMap.set(entry.habitId, entry);
    });

    // Combine habits with their today's status
    const habitsWithStatus = habits.map(habit => ({
      ...habit,
      todayCompleted: todayEntriesMap.get(habit._id)?.completed || false,
      todayCount: todayEntriesMap.get(habit._id)?.count || 0,
    }));

    return {
      habits: habitsWithStatus,
      totalHabits: habits.length,
      completedToday: habitsWithStatus.filter(h => h.todayCompleted).length,
    };
  },
}); 

// Get habit completion stats per day for the last 30 days
export const getCompletionHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const today = new Date();
    const days = 30;
    const result: { date: string; completed: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      // Count completed entries for this day
      const entries = await ctx.db
        .query("habitEntries")
        .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", dateStr))
        .collect();
      const completed = entries.filter(e => e.completed).length;
      result.push({ date: dateStr, completed });
    }
    return result;
  },
}); 

// Analytics & Insights for dashboard
export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    // Get all active habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get all entries for this user
    const allEntries = await ctx.db
      .query("habitEntries")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .collect();

    // Group by date
    const byDate: Record<string, { completed: number; total: number }> = {};
    for (const entry of allEntries) {
      if (!byDate[entry.date]) byDate[entry.date] = { completed: 0, total: 0 };
      byDate[entry.date].total++;
      if (entry.completed) byDate[entry.date].completed++;
    }

    // Calculate overall completion rate
    const totalCompletions = allEntries.filter(e => e.completed).length;
    const totalPossible = allEntries.length;
    const overallCompletionRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;

    // Last 7 days
    const today = new Date();
    const last7: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7.push(dateStr);
    }
    let last7Completions = 0, last7Possible = 0;
    for (const date of last7) {
      if (byDate[date]) {
        last7Completions += byDate[date].completed;
        last7Possible += byDate[date].total;
      }
    }
    const last7DaysCompletionRate = last7Possible > 0 ? (last7Completions / last7Possible) * 100 : 0;

    // Calculate current streak (consecutive days with at least one completion)
    const sortedDates = Object.keys(byDate).sort().reverse();
    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    
    for (const date of sortedDates) {
      if (byDate[date].completed > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const date of sortedDates) {
      if (byDate[date].completed > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Best/worst day (aggregate by day of week)
    const dayStats: Record<string, { total: number; count: number }> = {
      'Sunday': { total: 0, count: 0 },
      'Monday': { total: 0, count: 0 },
      'Tuesday': { total: 0, count: 0 },
      'Wednesday': { total: 0, count: 0 },
      'Thursday': { total: 0, count: 0 },
      'Friday': { total: 0, count: 0 },
      'Saturday': { total: 0, count: 0 }
    };
    
    for (const date in byDate) {
      const dayOfWeek = new Date(date + 'T00:00:00').getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[dayOfWeek];
      
      dayStats[dayName].total += byDate[date].completed;
      dayStats[dayName].count += 1;
    }
    
    // Calculate average completions per day of week
    let bestDay = "Monday", worstDay = "Sunday";
    let max = -1, min = 1e9;
    
    for (const day in dayStats) {
      const avgCompletions = dayStats[day].count > 0 ? dayStats[day].total / dayStats[day].count : 0;
      
      if (avgCompletions > max) {
        max = avgCompletions;
        bestDay = day;
      }
      if (avgCompletions < min) {
        min = avgCompletions;
        worstDay = day;
      }
    }

    return {
      overallCompletionRate: Math.round(overallCompletionRate),
      recentCompletionRate: Math.round(last7DaysCompletionRate),
      last7DaysCompletionRate: Math.round(last7DaysCompletionRate), // For backward compatibility
      bestDay,
      worstDay,
      bestDayCount: max === -1 ? 0 : Math.round(max), // For backward compatibility
      worstDayCount: min === 1e9 ? 0 : Math.round(min), // For backward compatibility
      totalHabits: habits.length,
      currentStreak,
      longestStreak,
    };
  },
}); 

// Get habit completion data for calendar heatmap (last 365 days)
export const getHeatmapData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const today = new Date();
    const days = 365;
    const result: { date: string; completed: number; total: number }[] = [];

    // Get all active habits for this user
    const activeHabits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const totalActiveHabits = activeHabits.length;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Get entries for this date
      const entries = await ctx.db
        .query("habitEntries")
        .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", dateStr))
        .collect();
      
      const completed = entries.filter(e => e.completed).length;
      
      // If there are active habits but no entries for this date, count as 0 completed out of total
      // If there are no active habits, count as 0/0
      const total = totalActiveHabits > 0 ? totalActiveHabits : 0;
      
      result.push({ date: dateStr, completed, total });
    }

    return result;
  },
}); 

// Get habit entries for a specific date
export const getEntriesForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .collect();

    return entries;
  },
}); 