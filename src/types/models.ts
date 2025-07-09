export interface BingoItem {
  id: number
  value: string
  keywords: string[]
  isMatched?: boolean
}

export interface BingoItemModal {
  bingoItemId: number;
  text: string;
}

export interface MatchedItem {
  id: number;
  motivation: string;
  evidence: string;
}

export interface AnalysisResult {
  matchedItems: MatchedItem[];
}

export interface AnalysisRequest {
  userText: string;
  bingoItems: BingoItem[];
}

export interface AnalysisResponse {
  results: AnalysisResult;
  error?: string;
}