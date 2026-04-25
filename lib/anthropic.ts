import OpenAI from "openai";

let _client: OpenAI | null = null;

export function groq(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return _client;
}

export const LLM_MODEL = process.env.LLM_MODEL ?? "llama-3.3-70b-versatile";
