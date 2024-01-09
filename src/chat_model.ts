import { ChatCohere } from "@langchain/cohere";

export const model = new ChatCohere({
  apiKey: process.env.COHERE_API_KEY, // Default
  maxRetries: 2,
  temperature: .6,
  model: 'command-light',
  onFailedAttempt: (err) => {
    console.log({  err })
  }
});