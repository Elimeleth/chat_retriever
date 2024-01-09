import { ChatCohere } from "@langchain/cohere";

export const model = new ChatCohere({
  apiKey: process.env.COHERE_API_KEY, // Default
});