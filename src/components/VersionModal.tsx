import { useState, useEffect } from "react"
import { VersionManager, type SavedVersion } from "../utils/versionManager"

interface VersionModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadVersion: (versionId: string) => void
  onSaveVersion: (name: string) => void
}

export const VersionModal = ({ 
  isOpen, 
  onClose, 
  onLoadVersion, 
  onSaveVersion 
}: VersionModalProps) => {
  const [isShowing, setIsShowing] = useState(false)
  const [versions, setVersions] = useState<SavedVersion[]>([])
  const [newVersionName, setNewVersionName] = useState("")
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

  const handleSaveNew = async () => {
    if (!newVersionName.trim()) {
      setError("Please enter a version name")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      await onSaveVersion(newVersionName.trim())
      setNewVersionName("")
      setVersions(VersionManager.getSavedVersions()) // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save version")
    } finally {
      setIsLoading(false)
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

  const handleDelete = (versionId: string) => {
    if (confirm("Are you sure you want to delete this version? This cannot be undone.")) {
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
            <h2 className="text-2xl font-bold text-[#44fc75]">Version Manager</h2>
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

          {/* Save new version */}
          <div className="border border-zinc-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">Save Current Version</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newVersionName}
                onChange={(e) => setNewVersionName(e.target.value)}
                placeholder="Enter version name..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveNew()}
                disabled={isLoading}
              />
              <button
                onClick={handleSaveNew}
                disabled={isLoading || !newVersionName.trim()}
                className="px-4 py-2 bg-[#44fc75] text-black font-semibold rounded hover:bg-[#3ce069] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Saved versions list */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-3">Saved Versions ({versions.length})</h3>
            <div className="overflow-y-auto max-h-64 border border-zinc-700 rounded-lg">
              {versions.length === 0 ? (
                <div className="p-4 text-center text-zinc-400">
                  No saved versions yet. Save your first version above!
                </div>
              ) : (
                <div className="divide-y divide-zinc-700">
                  {versions.map((version) => (
                    <div key={version.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
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
                            onClick={() => handleLoad(version.id)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDelete(version.id)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 