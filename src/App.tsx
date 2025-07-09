import { useState, useRef } from "react"
import { sendRequest, RateLimitError } from "./services/llmService"
import type { BingoItem, BingoItemModal } from "./types/models"
import { bingoItemModals } from "./data/bingoItemModals"
import { ExplanationModal } from "./components/explanationModal"
import { LabModal } from "./components/labModal"
import { VersionModal } from "./components/VersionModal"
import { bingoItems } from "./data/bingoItems"
import { BingoBoard } from "./components/BingoBoard"
import { RichTextEditor, type RichTextEditorRef } from "./components/RichTextEditor"

function App() {

  const [isLoading, setIsLoading] = useState(false)
  const [showingResults, setShowingResults] = useState(false)
  const [currentModal, setCurrentModal] = useState<BingoItemModal | null>(null)
  const [isLabModalOpen, setIsLabModalOpen] = useState(false)
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false)
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

  const handleSaveVersion = async (name: string) => {
    if (!editorRef.current) {
      throw new Error("Editor not available")
    }
    
    try {
      await editorRef.current.saveVersion(name)
    } catch (error) {
      console.error("Error saving version:", error)
      throw error
    }
  }

  const handleLoadVersion = async (versionId: string) => {
    if (!editorRef.current) {
      throw new Error("Editor not available")
    }
    
    try {
      await editorRef.current.loadVersion(versionId)
    } catch (error) {
      console.error("Error loading version:", error)
      throw error
    }
  }

  return (
    <div className="bg-zinc-800 min-h-screen w-full flex flex-col lg:flex-row items-center lg:gap-8  p-8">
      <div className="flex flex-col gap-4 w-full ">
        <img src="/LAB_logo.jpg" alt="Lab of Through" className="w-32 h-32" />
        <h1 className="lg:text-5xl font-bold uppercase text-[#44fc75] mb-8">Mobiliteit Omdenk Bingo</h1>
        <h3 className="text-lg text-[#44fc75] font-bold -mb-2">The Platform Builder:</h3>
        <RichTextEditor 
          ref={editorRef}
          className="w-full min-h-72 max-h-96 bg-zinc-900 text-white ring-[#44fc75] focus-within:ring-2 rounded-lg overflow-y-auto"
        />
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Version management button */}
        <button 
          className="w-full p-2 bg-zinc-700 text-white font-semibold hover:bg-zinc-600 active:bg-zinc-800 
                     transition-colors border-2 border-zinc-600 flex items-center justify-center gap-2 rounded-lg"
          onClick={() => setIsVersionModalOpen(true)}
        >
          📄 Manage Versions
        </button>
        
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
      <VersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        onSaveVersion={handleSaveVersion}
        onLoadVersion={handleLoadVersion}
      />
    </div>
  )
}

export default App
