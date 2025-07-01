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

export interface AnalysisResult {
  matchedItems: number[]; //ids of BingoItems that are matched
  confidence?: number; //0-100
  explanation?: string; //explanation of the match
}

export interface AnalysisRequest {
  userText: string;
  bingoItems: BingoItem[];
}

export interface AnalysisResponse {
  results: AnalysisResult;
  error?: string;
}