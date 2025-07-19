import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "../convex/_generated/api";
import { Auth } from "convex/server";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Get all notes for a specific user, ordered by date (newest first)
export const getNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return notes;
  },
});

// Get note for a specific note
export const getNote = query({
  args: {
    id: v.optional(v.id("notes")),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    if (!id) return null;
    const note = await ctx.db.get(id);
    return note;
  },
});

// Create a new note for a user
export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    isSummary: v.boolean(),
    date: v.optional(v.string()), // Optional date, defaults to today
  },
  handler: async (ctx, { title, content, isSummary, date }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");
    
    // Use provided date (should always be provided by frontend in local timezone)
    if (!date) {
      throw new Error("Date is required");
    }
    const entryDate = date;
    
    const noteId = await ctx.db.insert("notes", { 
      userId, 
      title, 
      content, 
      date: entryDate 
    });

    if (isSummary) {
      await ctx.scheduler.runAfter(0, internal.openai.summary, {
        id: noteId,
        title,
        content,
      });
    }

    return noteId;
  },
});

export const deleteNote = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
  },
});

export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.string(),
    content: v.string(),
    date: v.string(),
    regenerateSummary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { noteId, title, content, date, regenerateSummary } = args;
    await ctx.db.patch(noteId, { title, content, date });
    
    // If summary regeneration is requested, trigger AI summary
    if (regenerateSummary) {
      await ctx.scheduler.runAfter(0, internal.openai.summary, {
        id: noteId,
        title,
        content,
      });
    }
  },
});

// Regenerate AI summary for an existing note
export const regenerateSummary = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const { noteId } = args;
    const note = await ctx.db.get(noteId);
    
    if (!note) {
      throw new Error("Note not found");
    }
    
    // Trigger AI summary generation
    await ctx.scheduler.runAfter(0, internal.openai.summary, {
      id: noteId,
      title: note.title,
      content: note.content,
    });
    
    return noteId;
  },
});
