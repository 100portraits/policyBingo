import type { BingoItem } from "../types/models"
import { hyphenate } from "hyphen/nl"
import { useState, useEffect } from "react"

interface BingoSquareProps {
  item: BingoItem
  isMatched: boolean
  alternate: boolean
  onClick: () => void
}

export const BingoSquare = ({ item, isMatched, alternate, onClick }: BingoSquareProps) => {
  const isLabSquare = item.id === 13;
  const [hyphenatedText, setHyphenatedText] = useState(item.value);

  useEffect(() => {
    const hyphenateText = async () => {
      const text = await hyphenate(item.value);
      setHyphenatedText(text);
    };
    
    if (!isLabSquare) {
      hyphenateText();
    }
  }, [item.value, isLabSquare]);

  return (
    <button 
      onClick={onClick}
      className={`
        w-full h-full p-2 border border-zinc-700 flex items-center justify-center text-center font-bold text-sm 
        ${isMatched ? 'bg-[#44fc75] text-black' : alternate ? 'bg-zinc-900 text-white' : 'bg-zinc-700 text-white'}
        hover:opacity-80 transition-all duration-200
        break-words whitespace-normal truncate rounded-lg
        ${isLabSquare ? 'p-1' : 'p-2'}
      `}
    >
      {isLabSquare ? (
        <img 
          src="/LAB_logo.jpg" 
          alt="LAB Logo" 
          className="w-full h-full object-contain"
        />
      ) : (
        hyphenatedText
      )}
    </button>
  )
}