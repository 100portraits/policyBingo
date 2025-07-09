import { useState, useEffect } from "react"
import { VersionManager, type SavedVersion } from "./versionManager"

interface LoadVersionModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadVersion: (versionId: string) => void
}

export const LoadVersionModal = ({ 
  isOpen, 
  onClose, 
  onLoadVersion 
}: LoadVersionModalProps) => {
  const [isShowing, setIsShowing] = useState(false)
  const [versions, setVersions] = useState<SavedVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsShowing(true)
      setVersions(VersionManager.getSavedVersions())
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

  const handleLoad = async (versionId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await onLoadVersion(versionId)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load version")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (versionId: string, versionName: string) => {
    if (confirm(`Are you sure you want to delete "${versionName}"? This cannot be undone.`)) {
      try {
        VersionManager.deleteVersion(versionId)
        setVersions(VersionManager.getSavedVersions()) // Refresh the list
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete version")
      }
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
          bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] border border-zinc-800
          transition-all duration-200 ease-in-out overflow-hidden flex flex-col
          ${isShowing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <div className="flex flex-col gap-4 h-full">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-[#44fc75]">Load Version</h2>
              <p className="text-sm text-zinc-400">Click on a version to load it</p>
            </div>
            <button 
              onClick={handleClose}
              className="text-zinc-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Saved versions list */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-3">Saved Versions ({versions.length})</h3>
            <div className="overflow-y-auto max-h-96 border border-zinc-700 rounded-lg">
              {versions.length === 0 ? (
                <div className="p-8 text-center text-zinc-400">
                  <div className="text-4xl mb-3">📄</div>
                  <div className="text-lg mb-2">No saved versions yet</div>
                  <div className="text-sm">Save your first version to see it here!</div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-700">
                  {versions.map((version) => (
                    <div 
                      key={version.id} 
                      className="p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      onClick={() => handleLoad(version.id)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white mb-1">{version.name}</div>
                          <div className="text-sm text-zinc-400 mb-2">
                            {VersionManager.formatTimestamp(version.timestamp)}
                          </div>
                          {version.plainText && (
                            <div className="text-sm text-zinc-300 truncate">
                              {version.plainText.substring(0, version.plainText.indexOf('\n') > -1 ? 
                                Math.min(version.plainText.indexOf('\n'), 100) : 
                                100)}
                              {version.plainText.length > (version.plainText.indexOf('\n') > -1 ? 
                                Math.min(version.plainText.indexOf('\n'), 100) : 
                                100) && "..."}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation() // Prevent triggering the load action
                              handleDelete(version.id, version.name)
                            }}
                            disabled={isLoading}
                            className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                            title="Delete version"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-zinc-500 text-center">
            Versions are saved in your browser's local storage
          </div>
        </div>
      </div>
    </div>
  )
} 