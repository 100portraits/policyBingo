import type { BingoItemModal } from "../types/models";
import { bingoItems } from "../data/bingoItems";
import { useEffect, useState } from "react";

interface ExplanationModalProps {
  modal: BingoItemModal | null;
  onClose: () => void;
}

export const ExplanationModal = ({ modal, onClose }: ExplanationModalProps) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (modal) {
      setIsShowing(true);
    }
  }, [modal]);

  if (!modal) return null;

  const bingoItem = bingoItems.find(item => item.id === modal.bingoItemId);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsShowing(false);
      setTimeout(onClose, 200); // Wait for animation to complete
    }
  };

  const handleCloseClick = () => {
    setIsShowing(false);
    setTimeout(onClose, 200); // Wait for animation to complete
  };

  return (
    <div 
      className={`
        fixed inset-0 flex items-center justify-center p-4
        transition-all duration-200 ease-in-out
        ${isShowing ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'}
      `} 
      onClick={handleOverlayClick}
    >
      <div 
        className={`
          bg-white rounded-lg p-6 max-w-lg w-full
          transition-all duration-200 ease-in-out
          ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">{bingoItem?.value}</h2>
            <div className="text-sm text-zinc-600">
              Keywords: {bingoItem?.keywords.join(", ")}
            </div>
            <h3 className="text-lg font-bold mt-4">Something to think about:</h3>
            <div className="text-lg">{modal.text}</div>
          </div>
          <button 
            onClick={handleCloseClick}
            className="self-end px-4 py-2 bg-zinc-500 text-white rounded hover:bg-zinc-600 active:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
