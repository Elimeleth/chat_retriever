import { ChatCohere, Cohere } from "@langchain/cohere";

export const model = new Cohere({
  apiKey: process.env.COHERE_API_KEY, // Default
  maxRetries: 2,
  temperature: 0,
  maxTokens: 90,
  maxConcurrency: 2,
  cache: true,
  onFailedAttempt: (err) => {
    console.log({ err })
  }
});