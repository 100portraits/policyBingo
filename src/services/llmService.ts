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
  const regularItems = bingoItems.filter(item => item.id !== 13);
  const itemsText = regularItems.map(item => 
    `ID ${item.id}: ${item.value} | Keywords: ${item.keywords.join(", ")}`
  ).join("\n");

  return `You are a helpful assistant that analyzes Dutch/English mobility platform text for a bingo game. Each bingo item has an ID, main value, and related keywords. Your task is to analyse the user text and determine if the bingo items are present in the user text.

  Bingo items: 
  ${itemsText}

  A user text contains a bingo item when you can find:
  1. Exact matches with the bingo item value or its keywords
  2. Directly related keywords, synonyms, or abbreviations of the bingo item value

  Be precise in your analysis and conservative in bingo item matches. If a bingo item is not clearly present, do not include it in the results.

  Return your results in the specified JSON format.
  If no bingo items are present in the user text, return: {"matches": []}`
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
  console.log("System Prompt:", systemPrompt);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
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
                    motivation: { 
                      type: "string" , 
                      description: "Short explanation of why this item matches the user text",
                    },
                    evidence: { 
                      type: "array",
                      items: { type: "string" },
                      description: "A set of exact words or phrases from the user text (no duplicates)",
                     }
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
      max_tokens: 2000,
      temperature: 0.0,
      top_p: 0.9,
      data_collection: "deny",
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