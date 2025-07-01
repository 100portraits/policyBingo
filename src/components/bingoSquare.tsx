import type { BingoItem } from "../types/models"

export interface BingoSquareProps {
  item: BingoItem
  isMatched: boolean
  alternate: boolean
}

export const BingoSquare: React.FC<BingoSquareProps> = ({ item, isMatched, alternate }) => {
  return (
    <div className={`w-28 h-28 p-2 border flex items-center justify-center ${isMatched ? 'bg-green-500' : alternate ? 'bg-white' : 'bg-black'}`}>
      <div className={`w-24 text-center font-bold break-words ${isMatched ? 'text-white' : alternate ? 'text-black' : 'text-white'}`}>{item.value}</div>
    </div>
  )
}