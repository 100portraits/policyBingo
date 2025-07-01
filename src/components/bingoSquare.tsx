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
        w-full h-full p-2 border border-zinc-700 flex items-center justify-center text-center font-bold text-sm 
        ${isMatched ? 'bg-[#44fc75] text-black' : alternate ? 'bg-zinc-900 text-white' : 'bg-zinc-700 text-white'}
        hover:opacity-80 transition-all duration-200
        break-words whitespace-normal truncate rounded-lg
      `}
    >
      {item.value}
    </button>
  )
}