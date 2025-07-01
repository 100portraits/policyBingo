import type { BingoItem } from "../types/models"

interface BingoSquareProps {
  item: BingoItem
  isMatched: boolean
  alternate: boolean
  onClick: () => void
}

export const BingoSquare = ({ item, isMatched, alternate, onClick }: BingoSquareProps) => {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full h-full p-2 border-2 border-zinc-900 flex items-center justify-center text-center font-bold text-sm 
        ${isMatched ? 'bg-green-600 text-white' : alternate ? 'bg-zinc-300' : 'bg-white'}
        ${isMatched ? 'hover:bg-green-700' : alternate ? 'hover:bg-zinc-400' : 'hover:bg-zinc-300'}
        transition-colors
        break-words whitespace-normal truncate 
      `}
    >
      {item.value}
    </button>
  )
}