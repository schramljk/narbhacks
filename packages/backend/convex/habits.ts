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

    // Calculate total completion rate
    const totalEntries = entries.length;
    const completedEntries = entries.filter(e => e.completed).length;
    const completionRate = totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0;

    return {
      currentStreak,
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