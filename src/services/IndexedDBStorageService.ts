import { formatUploadDate } from '../utils/videoUtils';

export interface StoredVideo {
  id: string;
  file: File;
  title: string;
  description: string;
  uploadDate: string;
  duration: number;
  thumbnail: string;
  size: number;
}

export interface StorageStats {
  totalVideos: number;
  totalSize: number;
  availableQuota: number;
  usedQuota: number;
}

class IndexedDBStorageService {
  private dbName = 'StreamFlixDB';
  private dbVersion = 1;
  private storeName = 'videos';
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('uploadDate', 'uploadDate', { unique: false });
          store.createIndex('title', 'title', { unique: false });
        }
      };
    });
  }

  async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
  }

  async storeVideoFile(
    file: File,
    title: string,
    description: string,
    duration: number,
    thumbnail: string
  ): Promise<string> {
    await this.ensureDB();
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Check storage quota before storing
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const availableSpace = (estimate.quota || 0) - (estimate.usage || 0);
      
      if (file.size > availableSpace * 0.9) { // Leave 10% buffer
        throw new Error(`File too large. Available space: ${Math.round(availableSpace / 1024 / 1024)}MB, File size: ${Math.round(file.size / 1024 / 1024)}MB`);
      }
    }

    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const videoData: StoredVideo = {
      id: videoId,
      file: file,
      title,
      description,
      uploadDate: formatUploadDate(new Date()),
      duration,
      thumbnail,
      size: file.size
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(videoData);

      request.onsuccess = () => {
        resolve(videoId);
      };

      request.onerror = () => {
        reject(new Error('Failed to store video file'));
      };
    });
  }

  async getStoredVideo(videoId: string): Promise<StoredVideo | null> {
    await this.ensureDB();
    
    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(videoId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve video'));
      };
    });
  }

  async getAllStoredVideos(): Promise<StoredVideo[]> {
    await this.ensureDB();
    
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve videos'));
      };
    });
  }

  async deleteStoredVideo(videoId: string): Promise<void> {
    await this.ensureDB();
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(videoId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete video'));
      };
    });
  }

  async getStoredVideoUrl(videoId: string): Promise<string | null> {
    const video = await this.getStoredVideo(videoId);
    if (!video) {
      return null;
    }

    // Create blob URL for the file
    return URL.createObjectURL(video.file);
  }

  async getStorageStats(): Promise<StorageStats> {
    const videos = await this.getAllStoredVideos();
    const totalSize = videos.reduce((sum, video) => sum + video.size, 0);
    
    let availableQuota = 0;
    let usedQuota = 0;

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        availableQuota = estimate.quota || 0;
        usedQuota = estimate.usage || 0;
      } catch (error) {
        console.warn('Failed to get storage estimate:', error);
      }
    }

    return {
      totalVideos: videos.length,
      totalSize,
      availableQuota,
      usedQuota
    };
  }

  async clearAllVideos(): Promise<void> {
    await this.ensureDB();
    
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear videos'));
      };
    });
  }
}

// Export singleton instance
export const indexedDBStorage = new IndexedDBStorageService();
