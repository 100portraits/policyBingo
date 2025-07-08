import { useEffect, useState } from "react"

interface BingoModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BingoModal = ({ isOpen, onClose }: BingoModalProps) => {
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsShowing(false)
        setTimeout(onClose, 200)
      }
    }

    if (isShowing) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isShowing, onClose])

  if (!isOpen) return null

  const handleClose = () => {
    setIsShowing(false)
    setTimeout(onClose, 200)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

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
          bg-zinc-900 rounded-lg p-8 max-w-lg w-full border border-zinc-800
          transition-all duration-200 ease-in-out
          ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-[#44fc75] mb-4">🎉 BINGO! 🎉</h2>
            <p className="text-lg text-zinc-300">
              Congratulations! You've got a bingo! Your mobility policy shows strong alignment with technocratic language. Might it be time to rethink, based on your real values?
            </p>
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
  )
} 