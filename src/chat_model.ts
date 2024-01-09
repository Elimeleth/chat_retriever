import { ChatCohere, Cohere } from "@langchain/cohere";

export const model = new Cohere({
  apiKey: process.env.COHERE_API_KEY, // Default
  maxRetries: 2,
  temperature: .4,
  model: 'command-light',
  maxTokens: 90,
  onFailedAttempt: (err) => {
    console.log({ err })
  }
});