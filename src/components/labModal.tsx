import { useEffect, useState } from "react";

interface LabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LabModal = ({ isOpen, onClose }: LabModalProps) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

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
          bg-zinc-900 rounded-lg p-6 max-w-2xl border border-zinc-800
          transition-all duration-200 ease-in-out
          ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="/LAB_logo.jpg" 
              alt="LAB Logo" 
              className="w-48 h-48 object-contain"
            />
            <h2 className="text-2xl font-bold text-[#44fc75]">Lab of Thought</h2>
            <div className="text-lg text-zinc-300 text-center">
              The lab of thought is blah blah blah
            </div>
            <a 
              href="https://thelabofthought.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#44fc75] hover:underline mt-2"
            >
              Visit Lab of Thought →
            </a>
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