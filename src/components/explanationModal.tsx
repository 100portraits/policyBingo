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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsShowing(false);
        setTimeout(onClose, 200);
      }
    };

    if (isShowing) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isShowing, onClose]);

  if (!modal) return null;

  const bingoItem = bingoItems.find(item => item.id === modal.bingoItemId);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(onClose, 200);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className={`
        fixed inset-0 flex items-center justify-center p-4
        transition-all duration-200 ease-in-out
        ${isShowing ? 'bg-black/90 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'}
      `} 
      onClick={handleOverlayClick}
    >
      <div 
        className={`
          bg-zinc-900 rounded-lg p-6 max-w-lg w-full border border-zinc-800
          transition-all duration-200 ease-in-out
          ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-[#44fc75]">{bingoItem?.value}</h2>
            <div className="text-sm text-zinc-400">
              Keywords: {bingoItem?.keywords.join(", ")}
            </div>
            <h3 className="text-lg font-bold mt-4 text-white">Something to think about:</h3>
            <div className="text-lg text-zinc-300">{modal.text}</div>
          </div>
          <button 
            onClick={handleClose}
            className="self-end px-4 py-2 bg-[#44fc75] text-black font-semibold rounded hover:bg-[#3ce069] active:bg-[#35c75d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
