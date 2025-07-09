//file to handle the LLM calls and responses
import type { AnalysisRequest, AnalysisResponse, AnalysisResult, BingoItem } from "../types/models"
import { rateLimiter } from "./rateLimiter"

export class RateLimitError extends Error {
  timeUntilNextRequest: number;
  remainingRequests: number;

  constructor(timeUntilNextRequest: number, remainingRequests: number) {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
    this.timeUntilNextRequest = timeUntilNextRequest;
    this.remainingRequests = remainingRequests;
  }
}

const buildPrompt = (userText: string, bingoItems: BingoItem[]) => {
  const valueAndKeywords = bingoItems.map(item => `${item.value} (${item.keywords.join(", ")})`)
  return `
  You are a helpful assistant that can help with the following tasks:
  - Analyze the user's text and determine if it contains any of the bingo items.
  - If it does, return the bingo items that are mentioned, as a list of ids (numbers 1 through 25).
  - If it does not, return an empty array. 
  - The user's text is: ${userText}
  - The bingo items are: ${valueAndKeywords.join(", ")}
  `
}

//send request to LLM with openrouter
export const sendRequest = async (request: AnalysisRequest) => {

  console.log("Sending text to LLM:", request.userText)

  if (!rateLimiter.canMakeRequest()) {
    throw new RateLimitError(
      rateLimiter.getTimeUntilNextRequest(),
      rateLimiter.getRemainingRequests()
    );
  }

  const prompt = buildPrompt(request.userText, request.bingoItems)
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.5
    })
  })

  if (!response.ok) {
    throw new Error("Failed to send request to LLM")
  }

  rateLimiter.logRequest();
  const data = await response.json()
  const responseContent = data.choices[0].message.content
  return formatResponse(responseContent)
}

//format data into AnalysisResponse type (it will return just an array of numbers like [1, 2, 3, 4, 5])
export const formatResponse = (response: string): AnalysisResponse => {
  //remove the first and last character of the response
  const cleanedResponse = response.slice(1, -2)
  const matchedItems = cleanedResponse.split(",").map(Number)

  const results: AnalysisResult = {
    matchedItems: matchedItems,
  }

  return {
    results: results,
    error: undefined
  }
}