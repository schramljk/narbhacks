import OpenAI from "openai";
import { internalAction, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { missingEnvVariableUrl } from "./utils";

// Simple fallback summary generator
function generateFallbackSummary(title: string, content: string): string {
  const words = content.split(' ').filter(word => word.length > 0);
  const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  // Extract key information
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
  
  // Get first few sentences as preview
  const preview = sentences.slice(0, 2).join('. ').trim();
  const truncatedPreview = preview.length > 200 ? preview.substring(0, 200) + '...' : preview;
  
  return `Entry Summary:

Title: ${title}

Length: ${wordCount} words, ${sentenceCount} sentences

Average: ${avgWordsPerSentence} words per sentence

Preview: ${truncatedPreview}`;
}

export const openaiKeySet = query({
  args: {},
  handler: async () => {
    return !!process.env.OPENAI_API_KEY;
  },
});

export const summary = internalAction({
  args: {
    id: v.id("notes"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { id, title, content }) => {
    // Check if we already have a summary to avoid duplicate generation
    const existingNote = await ctx.runQuery(internal.notes.getNote, { id });
    if (existingNote?.summary && !existingNote.summary.includes('Failed to generate')) {
      console.log("Summary already exists, skipping generation");
      return;
    }
    try {
      // Truncate content to reduce token usage
      const maxContentLength = 1000; // Limit content length
      const truncatedContent = content.length > maxContentLength 
        ? content.substring(0, maxContentLength) + '...' 
        : content;

      const prompt = `Summarize this journal entry in 2-3 sentences:

Title: ${title}
Content: ${truncatedContent}`;

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        const error = "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.";
        console.error(error);
        await ctx.runMutation(internal.openai.saveSummary, {
          id: id,
          summary: error,
        });
        return;
      }

      const openai = new OpenAI({ apiKey });
      
      console.log("Generating AI summary for note:", id);
      
      const output = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates concise, well-written summaries of journal entries. Always respond with a clear summary that captures the main points and emotions expressed in the entry.",
          },
          { role: "user", content: prompt },
        ],
        model: "gpt-3.5-turbo-0125", // Using the cheapest available model
        max_tokens: 100, // Further reduced token limit to save costs
        temperature: 0.1, // Lower temperature for more consistent results
      });

      const messageContent = output.choices[0]?.message.content;
      
      if (!messageContent) {
        throw new Error("No response content from OpenAI");
      }

      console.log("AI summary generated successfully");
      
      await ctx.runMutation(internal.openai.saveSummary, {
        id: id,
        summary: messageContent.trim(),
      });
      
    } catch (error) {
      console.error("Error generating AI summary:", error);
      
      // Check if it's a quota/billing error
      if (error instanceof Error && error.message.includes('429')) {
        const fallbackSummary = generateFallbackSummary(title, content);
        await ctx.runMutation(internal.openai.saveSummary, {
          id: id,
          summary: `[AI Summary Unavailable - Using Basic Summary]\n\n${fallbackSummary}`,
        });
      } else {
        const errorMessage = `Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`;
        await ctx.runMutation(internal.openai.saveSummary, {
          id: id,
          summary: errorMessage,
        });
      }
    }
  },
});

export const saveSummary = internalMutation({
  args: {
    id: v.id("notes"),
    summary: v.string(),
  },
  handler: async (ctx, { id, summary }) => {
    await ctx.db.patch(id, {
      summary: summary,
    });
  },
});
