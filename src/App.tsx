import { useState } from "react"
import { BingoSquare } from "./components/bingoSquare"
import { sendRequest } from "./services/llmService"
import type { BingoItem, BingoItemModal } from "./types/models"
import { bingoItemModals } from "./data/bingoItemModals"
import { ExplanationModal } from "./components/explanationModal"
import { bingoItems } from "./data/bingoItems"

function App() {

  const [userText, setUserText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showingResults, setShowingResults] = useState(false)
  const [currentModal, setCurrentModal] = useState<BingoItemModal | null>(null)

  const [bingoBoard, setBingoBoard] = useState<BingoItem[]>(bingoItems)

  const handleGenerate = async () => {
    if (!userText.trim()) return
    setIsLoading(true)
    const response = await sendRequest({
      userText: userText,
      bingoItems: bingoItems
    })
    const matchesList = response.results.matchedItems
    matchesList.push(13)
    setBingoBoard(bingoBoard.map(item => ({ ...item, isMatched: matchesList.includes(item.id) })))
    setIsLoading(false)
    setShowingResults(true)
  }

  const handleReset = () => {
    setBingoBoard(bingoItems)
    setShowingResults(false)
  }

  const handleSquareClick = (itemId: number) => {
    const modalContent = bingoItemModals.find(modal => modal.bingoItemId === itemId)
    if (modalContent) {
      setCurrentModal(modalContent)
    }
  }

  return (
    <div className="bg-zinc-200 min-h-screen w-full flex flex-col lg:flex-row justify-center gap-8 items-center p-8">
      <div className="flex flex-col gap-4 md:w-fit w-full">
        <h1 className="text-4xl font-bold uppercase">Mobiliteit Omdenk Bingo</h1>
        <textarea className="w-full p-4 min-h-48  bg-white ring focus:outline-none focus:ring-3 ring-zinc-500" placeholder="Your platform here..." value={userText} onChange={(e) => setUserText(e.target.value)} />
        <button 
          className={`w-full p-2 bg-zinc-500 text-white hover:bg-zinc-600 active:bg-zinc-700 transition-colors border-2 border-zinc-900 flex items-center justify-center gap-2 ${!userText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`} 
          onClick={handleGenerate}
          disabled={!userText.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 m-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
               
            </>
          ) : (
            "Generate"
          )}
        </button>
        <div className={`flex flex-row gap-2 w-full justify-between items-center bg-zinc-300 pl-4 border ${!showingResults ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-md text-zinc-800">
            Click on a square to see an explanation
          </span>
          <button 
            className={`w-fit py-2 px-6 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors border-2 border-zinc-900`} 
            onClick={handleReset}
            disabled={!showingResults}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="h-full flex items-center justify-center">
        <div className="aspect-square h-[calc(100vh-4rem)] max-w-[calc(100vh-4rem)]">
          <div className="grid grid-cols-5 grid-rows-5 gap-2 h-full">
            {bingoBoard.map((item, index) => (
              <BingoSquare 
                key={item.id} 
                item={item} 
                isMatched={item.isMatched || false} 
                alternate={index % 2 === 1}
                onClick={() => handleSquareClick(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
      <ExplanationModal 
        modal={currentModal} 
        onClose={() => setCurrentModal(null)} 
      />
    </div>
  )
}

export default App
