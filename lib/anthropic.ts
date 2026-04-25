import Anthropic from "@anthropic-ai/sdk";

declare global {
  var anthropic: Anthropic | undefined;
}

export const anthropic =
  globalThis.anthropic ??
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.anthropic = anthropic;
}

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";
