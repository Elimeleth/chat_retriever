import { ChatCohere, Cohere } from "@langchain/cohere";

export const model = new Cohere({
  apiKey: process.env.COHERE_API_KEY, // Default
  maxRetries: 2,
  temperature: .6,
  model: 'command-light',
  maxTokens: 100,
  onFailedAttempt: (err) => {
    console.log({  err })
  }
});