import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get notes for the current user
export const getNotes = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Add a new note
export const addNote = mutation({
  args: { userId: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("notes", { userId: args.userId, text: args.text });
  },
});

