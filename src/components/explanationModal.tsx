import type { BingoItemModal } from "../types/models";
import { bingoItems } from "../data/bingoItems";


interface ExplanationModalProps {
  modal: BingoItemModal | null;
  onClose: () => void;
}


export const ExplanationModal = ({ modal, onClose }: ExplanationModalProps) => {
  if (!modal) return null;

  const bingoItem = bingoItems.find(item => item.id === modal.bingoItemId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
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
            onClick={onClose}
            className="self-end px-4 py-2 bg-zinc-500 text-white rounded hover:bg-zinc-600 active:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
