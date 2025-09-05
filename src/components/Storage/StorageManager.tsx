import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Trash2, Eye, Clock } from 'lucide-react';
import { indexedDBStorage, StoredVideo } from '../../services/IndexedDBStorageService';
import { formatTimeAgo } from '../../utils/videoUtils';
import toast from 'react-hot-toast';

export const StorageManager: React.FC = () => {
  const [storedFiles, setStoredFiles] = useState<StoredVideo[]>([]);
  const [storageStats, setStorageStats] = useState({ totalFiles: 0, totalSize: 0, totalSizeFormatted: '0 Bytes' });

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const files = await indexedDBStorage.getAllStoredVideos();
      const stats = await indexedDBStorage.getStorageStats();
      setStoredFiles(files);
      setStorageStats({
        totalFiles: stats.totalVideos,
        totalSize: stats.totalSize,
        totalSizeFormatted: formatFileSize(stats.totalSize)
      });
    } catch (error) {
      console.error('Failed to load stored files:', error);
      toast.error('Failed to load stored files');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        await indexedDBStorage.deleteStoredVideo(fileId);
        toast.success('Video deleted successfully');
        loadStorageData(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete video:', error);
        toast.error('Failed to delete video');
      }
    }
  };

  const handlePreviewFile = async (file: StoredVideo) => {
    try {
      const videoUrl = await indexedDBStorage.getStoredVideoUrl(file.id);
      if (videoUrl) {
        // Open in a new window/tab for preview
        window.open(videoUrl, '_blank');
      } else {
        toast.error('Video not found');
      }
    } catch (error) {
      console.error('Failed to preview video:', error);
      toast.error('Failed to preview video');
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <HardDrive className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-white">Local Storage Manager</h2>
      </div>

      {/* Storage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{storageStats.totalFiles}</div>
          <div className="text-sm text-gray-400">Total Videos</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{storageStats.totalSizeFormatted}</div>
          <div className="text-sm text-gray-400">Storage Used</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">Local</div>
          <div className="text-sm text-gray-400">Storage Type</div>
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3">Uploaded Videos</h3>
        
        {storedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No videos uploaded yet</p>
          </div>
        ) : (
          storedFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <h4 className="text-white font-medium truncate">{file.title}</h4>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(file.uploadDate)}
                  </span>
                  <span>{formatFileSize(file.size)}</span>
                  <span className="uppercase text-xs bg-gray-600 px-2 py-1 rounded">
                    {file.file.type.split('/')[1]?.toUpperCase() || 'VIDEO'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreviewFile(file)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Preview video"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Delete video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {storedFiles.length > 0 && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-200">
            <strong>Note:</strong> Videos are stored locally in your browser's storage. 
            They will persist across sessions but may be cleared if you clear browser data.
            In a production environment, videos would be stored on a server or cloud storage service.
          </p>
        </div>
      )}
    </div>
  );
};
