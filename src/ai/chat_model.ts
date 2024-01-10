/*
Cabe destacar que use cohere por su free tier no comercial

pero se puede usar cloudflare woker con una AI pequeña corriendo como serverless
*/

import { Cohere } from "@langchain/cohere"

export const model =  new Cohere({
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