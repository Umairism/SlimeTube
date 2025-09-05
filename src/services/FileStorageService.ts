// File storage service for handling video uploads and storage
import { formatUploadDate, formatDuration, getVideoDuration, generateVideoThumbnail } from '../utils/videoUtils';

interface StoredFile {
  id: string;
  originalName: string;
  storedPath: string;
  size: number;
  type: string;
  uploadDate: string;
}

class FileStorageService {
  private storedFiles: Map<string, StoredFile> = new Map();

  constructor() {
    // Load existing files from localStorage on initialization
    this.loadStoredFiles();
  }

  private loadStoredFiles() {
    try {
      const stored = localStorage.getItem('streamflix_uploaded_files');
      if (stored) {
        const files = JSON.parse(stored);
        this.storedFiles = new Map(Object.entries(files));
      }
    } catch (error) {
      console.error('Failed to load stored files:', error);
    }
  }

  private saveStoredFiles() {
    try {
      const filesObj = Object.fromEntries(this.storedFiles);
      localStorage.setItem('streamflix_uploaded_files', JSON.stringify(filesObj));
    } catch (error) {
      console.error('Failed to save stored files:', error);
    }
  }

  async storeVideoFile(file: File): Promise<StoredFile> {
    try {
      const fileId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In a real application, you would upload to a server or cloud storage
      // For demo purposes, we'll create a persistent blob URL and store metadata
      const persistentUrl = await this.createPersistentBlobUrl(file, fileId);

      const storedFile: StoredFile = {
        id: fileId,
        originalName: file.name,
        storedPath: persistentUrl,
        size: file.size,
        type: file.type,
        uploadDate: formatUploadDate()
      };

      this.storedFiles.set(fileId, storedFile);
      this.saveStoredFiles();

      return storedFile;
    } catch (error) {
      throw new Error(`Failed to store video file: ${error}`);
    }
  }

  private async createPersistentBlobUrl(file: File, fileId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          // Store the file data in localStorage (for demo - in production use proper storage)
          const base64Data = reader.result as string;
          localStorage.setItem(`streamflix_video_${fileId}`, base64Data);
          
          // Return a reference that we can use to retrieve the file later
          resolve(`stored://${fileId}`);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  getStoredVideoUrl(storedPath: string): string {
    if (storedPath.startsWith('stored://')) {
      const fileId = storedPath.replace('stored://', '');
      try {
        const base64Data = localStorage.getItem(`streamflix_video_${fileId}`);
        if (base64Data) {
          // Convert base64 back to blob URL for playback
          const blob = this.base64ToBlob(base64Data);
          return URL.createObjectURL(blob);
        }
      } catch (error) {
        console.error('Failed to retrieve stored video:', error);
      }
    }
    
    // Fallback to original path if stored version not found
    return storedPath;
  }

  private base64ToBlob(base64Data: string): Blob {
    const [header, data] = base64Data.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'video/mp4';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return new Blob([bytes], { type: mimeType });
  }

  async generateThumbnailFromFile(file: File): Promise<string> {
    try {
      return await generateVideoThumbnail(file);
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return '/default-thumbnail.jpg';
    }
  }

  async getVideoDurationFromFile(file: File): Promise<string> {
    try {
      const duration = await getVideoDuration(file);
      return formatDuration(duration);
    } catch (error) {
      console.error('Failed to get video duration:', error);
      return '0:00';
    }
  }

  getStoredFile(fileId: string): StoredFile | undefined {
    return this.storedFiles.get(fileId);
  }

  getAllStoredFiles(): StoredFile[] {
    return Array.from(this.storedFiles.values());
  }

  deleteStoredFile(fileId: string): boolean {
    try {
      // Remove from memory
      const success = this.storedFiles.delete(fileId);
      
      if (success) {
        // Remove from localStorage
        localStorage.removeItem(`streamflix_video_${fileId}`);
        this.saveStoredFiles();
      }
      
      return success;
    } catch (error) {
      console.error('Failed to delete stored file:', error);
      return false;
    }
  }

  // Get storage statistics
  getStorageStats() {
    const files = this.getAllStoredFiles();
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalFiles = files.length;
    
    return {
      totalFiles,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize)
    };
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const FileStorage = new FileStorageService();
export type { StoredFile };
