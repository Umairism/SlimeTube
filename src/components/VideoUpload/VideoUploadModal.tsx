import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Video, Image, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { VideoService } from '../../services/VideoService';
import { indexedDBStorage } from '../../services/IndexedDBStorageService';
import { generateVideoThumbnail, getVideoDuration, formatDuration } from '../../utils/videoUtils';
import { useVideoRefresh } from '../../contexts/VideoContext';
import toast from 'react-hot-toast';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUploaded?: () => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onVideoUploaded
}) => {
  const { user } = useAuth();
  const { triggerRefresh } = useVideoRefresh();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'entertainment',
    tags: '',
    quality: '1080p'
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 500MB for demo)
      if (file.size > 500 * 1024 * 1024) {
        toast.error('Video file size should be less than 500MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }
      
      setVideoFile(file);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setThumbnailFile(file);
    }
  };

  const simulateUpload = () => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        setUploadProgress(Math.min(progress, 100));
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to upload videos');
      return;
    }

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    // Validate video file
    const maxSize = 100 * 1024 * 1024; // 100MB limit
    if (videoFile.size > maxSize) {
      toast.error('Video file is too large. Maximum size is 100MB.');
      return;
    }

    if (!videoFile.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('Starting video upload process...');
      
      // Simulate file upload progress
      await simulateUpload();
      console.log('Upload simulation completed');

      // Generate thumbnail if not provided
      let thumbnailUrl = '/default-thumbnail.jpg';
      if (thumbnailFile) {
        console.log('Converting custom thumbnail to base64...');
        // Convert thumbnail file to base64 data URL instead of blob URL
        thumbnailUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(thumbnailFile);
        });
        console.log('Custom thumbnail converted to base64');
      } else {
        try {
          console.log('Generating thumbnail from video...');
          thumbnailUrl = await generateVideoThumbnail(videoFile);
          console.log('Thumbnail generated successfully');
        } catch (error) {
          console.log('Could not generate thumbnail, using default:', error);
        }
      }

      // Get actual video duration
      console.log('Extracting video duration...');
      const actualDuration = await getVideoDuration(videoFile);
      console.log('Video duration extracted:', actualDuration);

      // Store the video file permanently using IndexedDB
      console.log('Storing video in IndexedDB...');
      const videoId = await indexedDBStorage.storeVideoFile(
        videoFile,
        formData.title,
        formData.description,
        actualDuration,
        thumbnailUrl
      );
      console.log('Video stored with ID:', videoId);
      
      const storedVideoUrl = `stored://${videoId}`;
      console.log('Created video URL:', storedVideoUrl);
      console.log('Thumbnail URL:', thumbnailUrl);

      // Create video object with real data
      console.log('Creating video data object...');
      const videoData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        quality: [formData.quality],
        creator: {
          name: user.name,
          avatar: user.avatar || '/default-avatar.png',
          subscribers: 0
        },
        videoUrl: storedVideoUrl,
        thumbnail: thumbnailUrl,
        duration: formatDuration(actualDuration),
        uploadDate: new Date().toISOString().split('T')[0] // Real upload date
      };

      console.log('Final video data object:', {
        ...videoData,
        videoUrl: videoData.videoUrl,
        thumbnail: videoData.thumbnail
      });

      console.log('Uploading video to service...');
      await VideoService.uploadVideo(videoData);
      console.log('Video uploaded successfully to service');
      
      toast.success('Video uploaded successfully!');
      
      // Trigger refresh to update video lists across the app
      triggerRefresh();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'entertainment',
        tags: '',
        quality: '1080p'
      });
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
      
      onVideoUploaded?.();
      onClose();
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('storage')) {
          toast.error(`Storage error: ${error.message}`);
        } else if (error.message.includes('thumbnail')) {
          toast.error('Failed to generate video thumbnail. Please try with a smaller video file.');
        } else if (error.message.includes('duration')) {
          toast.error('Failed to extract video duration. Please try with a different video format.');
        } else {
          toast.error(`Upload failed: ${error.message}`);
        }
      } else {
        toast.error('Failed to upload video. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const categories = [
    'entertainment',
    'education', 
    'music',
    'sports',
    'technology',
    'comedy',
    'documentary',
    'action',
    'drama',
    'horror',
    'sci-fi'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload Video
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={isUploading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video File *
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                  id="video-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Video className="w-12 h-12 text-gray-400" />
                  <div className="text-white">
                    {videoFile ? videoFile.name : 'Click to select video file'}
                  </div>
                  <div className="text-sm text-gray-400">
                    Supported formats: MP4, AVI, MOV (Max: 500MB)
                  </div>
                </label>
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thumbnail (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Image className="w-8 h-8 text-gray-400" />
                  <div className="text-white text-sm">
                    {thumbnailFile ? thumbnailFile.name : 'Click to select thumbnail'}
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter video title"
                disabled={isUploading}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter video description"
                disabled={isUploading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                  disabled={isUploading}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quality
                </label>
                <select
                  name="quality"
                  value={formData.quality}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                  disabled={isUploading}
                >
                  <option value="4K">4K</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. action, adventure, thriller"
                disabled={isUploading}
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading || !videoFile || !formData.title.trim()}
              >
                <Save className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
