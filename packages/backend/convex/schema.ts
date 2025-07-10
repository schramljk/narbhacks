import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
  }),
  
  habits: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    frequency: v.string(), // "daily", "weekly", "monthly"
    targetCount: v.optional(v.number()), // for habits like "drink 8 glasses of water"
    color: v.optional(v.string()), // for UI customization
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  habitEntries: defineTable({
    habitId: v.id("habits"),
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD format
    completed: v.boolean(),
    count: v.optional(v.number()), // for habits with target counts
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_habit_date", ["habitId", "date"])
    .index("by_user_date", ["userId", "date"]),
  
  habitReminders: defineTable({
    habitId: v.id("habits"),
    userId: v.string(),
    time: v.string(), // HH:MM format
    days: v.array(v.string()), // ["monday", "tuesday", etc.]
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_habit", ["habitId"]),
});
