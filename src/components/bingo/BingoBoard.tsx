import { useEffect, useState } from "react"
import { BingoSquare } from "./bingoSquare"
import type { BingoItem } from "../../types/models"
import { BingoModal } from "./BingoModal"

interface BingoBoardProps {
  bingoBoard: BingoItem[]
  onSquareClick: (itemId: number) => void
}

export const BingoBoard = ({ bingoBoard, onSquareClick }: BingoBoardProps) => {
  const [showBingoModal, setShowBingoModal] = useState(false)

  const checkForBingo = () => {
    // Check rows
    for (let i = 0; i < 5; i++) {
      const row = bingoBoard.slice(i * 5, (i + 1) * 5)
      if (row.every(item => item.isMatched)) return true
    }

    // Check columns
    for (let i = 0; i < 5; i++) {
      const column = [
        bingoBoard[i],
        bingoBoard[i + 5],
        bingoBoard[i + 10],
        bingoBoard[i + 15],
        bingoBoard[i + 20]
      ]
      if (column.every(item => item.isMatched)) return true
    }

    // Check diagonals
    const diagonal1 = [
      bingoBoard[0],
      bingoBoard[6],
      bingoBoard[12],
      bingoBoard[18],
      bingoBoard[24]
    ]
    const diagonal2 = [
      bingoBoard[4],
      bingoBoard[8],
      bingoBoard[12],
      bingoBoard[16],
      bingoBoard[20]
    ]

    return diagonal1.every(item => item.isMatched) || diagonal2.every(item => item.isMatched)
  }

  useEffect(() => {
    if (checkForBingo()) {
      setShowBingoModal(true)
    }
  }, [bingoBoard])

  return (
    <div className="h-full flex justify-center items-center">
      <div className="aspect-square h-[calc(100vh-4rem)] max-w-[calc(100vh-4rem)]">
        <div className="grid grid-cols-5 grid-rows-5 gap-2 h-full">
          {bingoBoard.map((item, index) => (
            <BingoSquare 
              key={item.id} 
              item={item} 
              isMatched={item.isMatched || false} 
              alternate={index % 2 === 1}
              onClick={() => onSquareClick(item.id)}
            />
          ))}
        </div>
      </div>
      <BingoModal 
        isOpen={showBingoModal}
        onClose={() => setShowBingoModal(false)}
      />
    </div>
  )
} 