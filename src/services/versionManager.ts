export interface SavedVersion {
  id: string
  name: string
  content: string
  timestamp: number
  plainText?: string
}

const STORAGE_KEY = 'editor-versions'

export class VersionManager {
  static getSavedVersions(): SavedVersion[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading saved versions:', error)
      return []
    }
  }

  static saveVersion(name: string, content: string, plainText?: string): SavedVersion {
    const versions = this.getSavedVersions()
    const newVersion: SavedVersion = {
      id: crypto.randomUUID(),
      name,
      content,
      timestamp: Date.now(),
      plainText
    }
    
    versions.unshift(newVersion) // Add to beginning for newest first
    
    // Keep only latest 50 versions to prevent localStorage bloat
    if (versions.length > 50) {
      versions.splice(50)
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(versions))
      return newVersion
    } catch (error) {
      console.error('Error saving version:', error)
      throw new Error('Failed to save version. Storage may be full.')
    }
  }

  static deleteVersion(id: string): void {
    const versions = this.getSavedVersions().filter(v => v.id !== id)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(versions))
    } catch (error) {
      console.error('Error deleting version:', error)
      throw new Error('Failed to delete version.')
    }
  }

  static getVersion(id: string): SavedVersion | null {
    return this.getSavedVersions().find(v => v.id === id) || null
  }

  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString()
  }
} 