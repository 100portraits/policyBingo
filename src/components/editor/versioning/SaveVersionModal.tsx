import { useState, useEffect } from "react"

interface SaveVersionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
}

export const SaveVersionModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: SaveVersionModalProps) => {
  const [isShowing, setIsShowing] = useState(false)
  const [versionName, setVersionName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true)
      setVersionName("")
      setError(null)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isShowing) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isShowing])

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

  const handleSave = async () => {
    if (!versionName.trim()) {
      setError("Please enter a version name")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      await onSave(versionName.trim())
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save version")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className={`
        fixed inset-0 flex items-center justify-center p-4 z-50
        transition-all duration-200 ease-in-out
        ${isShowing ? 'bg-black/90 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'}
      `} 
      onClick={handleOverlayClick}
    >
      <div 
        className={`
          bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-zinc-800
          transition-all duration-200 ease-in-out
          ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleClose}
            className="text-zinc-400 hover:text-white text-2xl absolute top-2 right-4"
          >
            ×
          </button>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-[#44fc75]">Save Version</h2>
              <h3 className="text-sm text-zinc-400">These versions are saved in your browser's local storage. No data is sent to any server.</h3>
            </div>

          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label className="text-white font-medium">Version Name:</label>
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="e.g., Draft v1, Final version, Working copy..."
              className="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-400"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !versionName.trim()}
              className="px-4 py-2 bg-[#44fc75] text-black font-semibold rounded hover:bg-[#3ce069] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 