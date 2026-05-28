import Anthropic from "@anthropic-ai/sdk";

// SERVER-SIDE ONLY. This module must never be imported into a client component.
// The API key lives in the environment and never reaches the browser.
if (typeof window !== "undefined") {
  throw new Error("anthropic.ts must not be imported on the client.");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Single config point for the model — update here when a newer model ships.
export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

export const MAX_TOKENS = 2048;
