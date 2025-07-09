import { useState, useRef } from "react"
import { sendRequest, RateLimitError } from "./services/llmService"
import type { BingoItem, BingoItemModal } from "./types/models"
import { bingoItemModals } from "./data/bingoItemModals"
import { ExplanationModal } from "./components/explanationModal"
import { LabModal } from "./components/labModal"
import { bingoItems } from "./data/bingoItems"
import { BingoBoard } from "./components/BingoBoard"
import { RichTextEditor, type RichTextEditorRef } from "./components/RichTextEditor"

function App() {

  const [isLoading, setIsLoading] = useState(false)
  const [showingResults, setShowingResults] = useState(false)
  const [currentModal, setCurrentModal] = useState<BingoItemModal | null>(null)
  const [isLabModalOpen, setIsLabModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [bingoBoard, setBingoBoard] = useState<BingoItem[]>(bingoItems)

  // Ref to access the RichTextEditor methods
  const editorRef = useRef<RichTextEditorRef>(null)

  const handleGenerate = async () => {
    // Get plain text content from the editor
    if (!editorRef.current) return
    
    const plainText = await editorRef.current.getPlainText()
    
    if (!plainText) return
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await sendRequest({
        userText: plainText,
        bingoItems: bingoItems
      })
      const matchesList = response.results.matchedItems
      matchesList.push(13)
      setBingoBoard(bingoBoard.map(item => ({ ...item, isMatched: matchesList.includes(item.id) })))
      setShowingResults(true)
    } catch (e) {
      if (e instanceof RateLimitError) {
        const waitTimeSeconds = Math.ceil(e.timeUntilNextRequest / 1000);
        setError(`Rate limit reached. Please wait ${waitTimeSeconds} seconds. You have used ${5 - e.remainingRequests}/5 requests in the last minute.`);
      } else {
        setError("An error occurred while analyzing your text. Please try again.");
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setBingoBoard(bingoItems)
    setShowingResults(false)
    setError(null)
  }

  const handleSquareClick = (itemId: number) => {
    if (itemId === 13) {
      setIsLabModalOpen(true);
      return;
    }
    
    const modalContent = bingoItemModals.find(modal => modal.bingoItemId === itemId)
    if (modalContent) {
      setCurrentModal(modalContent)
    }
  }

  return (
    <div className="bg-zinc-800 min-h-screen w-full flex flex-col lg:flex-row items-center lg:gap-8  p-8">
      <div className="flex flex-col gap-4 w-full ">
        <h1 className="text-6xl font-bold uppercase text-[#44fc75] mb-12">Mobiliteit Omdenk Bingo</h1>
        <h3 className="text-lg text-[#44fc75] font-bold -mb-2">The Platform Builder:</h3>
        <RichTextEditor 
          ref={editorRef}
          className="w-full min-h-72 bg-zinc-900 text-white ring-[#44fc75] focus-within:ring-2 rounded-lg overflow-hidden"
        />
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <button 
          className={`
            w-full p-2 bg-[#44fc75] text-black font-semibold hover:bg-[#3ce069] active:bg-[#35c75d] 
            transition-colors border-2 border-[#44fc75] flex items-center justify-center gap-2 rounded-lg
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `} 
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 m-1 border-2 border-black border-t-transparent rounded-full animate-spin" />
               
            </>
          ) : (
            "Check my platform"
          )}
        </button>
        <div className={`
          flex flex-row gap-2 w-full justify-between items-center 
          bg-zinc-900/50 pl-4 border border-zinc-800 rounded-lg
          ${!showingResults ? 'opacity-0' : 'opacity-100'}
        `}>
          <span className="text-md text-zinc-300">
            Click on a square to see an explanation
          </span>
          <button 
            className={`
              w-fit py-2 px-6 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 
              transition-colors border-l border-zinc-800 font-semibold
            `} 
            onClick={handleReset}
            disabled={!showingResults}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full flex-3/5">
      <BingoBoard 
        bingoBoard={bingoBoard}
        onSquareClick={handleSquareClick}
        />
      </div>
      <ExplanationModal 
        modal={currentModal} 
        onClose={() => setCurrentModal(null)} 
      />
      <LabModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
      />
    </div>
  )
}

export default App
