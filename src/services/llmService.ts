//file to handle the LLM calls and responses
import type { AnalysisRequest, AnalysisResponse, AnalysisResult, MatchedItem, BingoItem } from "../types/models"
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

const buildSystemPrompt = (bingoItems: BingoItem[]): string => {
  const itemsWithIds = bingoItems.map(item => 
    `${item.id}: ${item.value} (${item.keywords.join(", ")})`)

  return `You are a helpful assistant that analyzes user text to find matches with bingo items. You will receive a list of bingo items, each with a unique id and a set of keywords. 
  
  Your task is to identify which bingo items match the user's text based on the keywords provided.

  Consider the following when analyzing the user text:
  - The user text is in Dutch and may contain variations, abbreviations, or common phrases
  - Use a combination of exact keyword matching, common variations, and clear English-Dutch equivalents

  Bingo items: ${itemsWithIds.join(", ")}

  Provide a JSON response with the speficied structure.
  If no items are matched, return: {"matches": []}`
}

//send request to LLM with openrouter
export const sendRequest = async (request: AnalysisRequest) => {
  if (!rateLimiter.canMakeRequest()) {
    throw new RateLimitError(
      rateLimiter.getTimeUntilNextRequest(),
      rateLimiter.getRemainingRequests()
    );
  }

  const systemPrompt = buildSystemPrompt(request.bingoItems)
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request.userText }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "AnalysisResponse",
          strict: true,
          schema: {
            type: "object",
            properties: {
              matches : {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    motivation: { type: "string" },
                    evidence: { type: "string" }
                  },
                  required: ["id", "motivation", "evidence"],
                  additionalProperties: false,
                }
              }
            },
            required: ["matches"],
            additionalProperties: false,
          }
        }
      },
      max_tokens: 1000,
      temperature: 0.2,
      top_p: 0.9,
    })
  })

  if (!response.ok) {
    throw new Error("Failed to send request to LLM")
  }

  rateLimiter.logRequest();
  const data = await response.json()
  const responseContent = data.choices[0].message.content

  // Log the LLM response for debugging
  console.log("LLM Response:", responseContent);

  return formatResponse(responseContent)
}

//format data into AnalysisResponse type
export const formatResponse = (response: string): AnalysisResponse => {
  try {
    const parsedResponse = JSON.parse(response);
    
    // With structured output, we can trust the schema is followed
    const matchedItems: MatchedItem[] = parsedResponse.matches.map((match: any) => ({
      id: match.id,
      motivation: match.motivation,
      evidence: match.evidence
    }));

    const results: AnalysisResult = {
      matchedItems: matchedItems,
    }

    return {
      results: results,
      error: undefined
    }
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    return {
      results: { matchedItems: [] },
      error: "Failed to parse LLM response"
    }
  }
}