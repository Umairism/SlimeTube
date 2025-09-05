import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  Download, 
  ThumbsUp, 
  Eye, 
  Calendar,
  Tag,
  Users,
  Clock
} from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer/VideoPlayer';
import { VideoCard } from '../components/VideoCard';
import { Breadcrumb } from '../components/Layout/Breadcrumb';
import { useVideoDatabase } from '../hooks/useVideoDatabase';
import { useAuth } from '../contexts/AuthContext';
import { Video } from '../types';
import { formatViewCount, formatTimeAgo } from '../data/constants';
import toast from 'react-hot-toast';

export function VideoDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { 
    getVideoById, 
    videos, 
    addToWishlist, 
    addToWatchHistory,
    likeVideo,
    incrementViews,
    isInWishlist
  } = useVideoDatabase();
  const { isAuthenticated, user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [showDescription, setShowDescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (id) {
      loadVideo();
    }
  }, [id]);

  const loadVideo = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const foundVideo = await getVideoById(id);
      if (foundVideo) {
        setVideo(foundVideo);
        
        // Track view and add to watch history
        await incrementViews(id);
        if (isAuthenticated) {
          await addToWatchHistory(id);
        }
        
        // Get related videos based on tags and category
        const related = videos
          .filter(v => v.id !== id)
          .filter(v => 
            v.category === foundVideo.category || 
            v.tags.some(tag => foundVideo.tags.includes(tag))
          )
          .slice(0, 8);
        setRelatedVideos(related);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      toast.error('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!video || !isAuthenticated) {
      toast.error('Please login to like videos');
      return;
    }

    if (hasLiked) {
      toast('You already liked this video', { icon: 'ℹ️' });
      return;
    }

    try {
      await likeVideo(video.id);
      setHasLiked(true);
      // Update local video state
      setVideo(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleDownload = () => {
    if (!isAuthenticated) {
      toast.error('Please login to download videos');
      return;
    }
    toast.success('Download started!');
    // In a real app, this would trigger the download
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-800 rounded-lg aspect-video mb-8"></div>
            <div className="bg-gray-700 h-8 rounded mb-4"></div>
            <div className="bg-gray-700 h-4 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 bg-gray-800 rounded-lg h-64"></div>
              <div className="bg-gray-800 rounded-lg h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video not found</h1>
          <Link to="/" className="text-red-500 hover:text-red-400">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbPath = [
    { label: 'Home', path: '/' },
    { label: 'Watch', path: `/video/${video.id}` },
    { label: video.title, path: `/video/${video.id}` }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Breadcrumb customPath={breadcrumbPath} showBackButton backPath="/" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <VideoPlayer
                videoUrl={video.videoUrl}
                poster={video.thumbnail}
              />
            </motion.div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Title and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
                    {video.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatViewCount(video.views)} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatTimeAgo(video.uploadDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{video.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => addToWishlist(video.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isInWishlist(video.id)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(video.id) ? 'fill-current' : ''}`} />
                    <span>Wishlist</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center justify-between bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={video.creator.avatar}
                    alt={video.creator.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{video.creator.name}</h3>
                    <div className="flex items-center space-x-1 text-gray-400 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{(video.creator.subscribers / 1000000).toFixed(1)}M subscribers</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 text-red-400">
                  <ThumbsUp className="h-5 w-5" />
                  <span className="font-semibold">{video.likes.toLocaleString()}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-800 rounded-xl p-6">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="text-lg font-semibold mb-3 hover:text-red-400 transition-colors"
                >
                  Description {showDescription ? '▼' : '▶'}
                </button>
                
                {showDescription && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {video.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">Category: </span>
                        <span className="text-white">{video.category}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400 text-sm">Available Quality: </span>
                        <span className="text-white">{video.quality.join(', ')}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/search?q=${encodeURIComponent(tag)}`}
                      className="bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-6">Related Videos</h2>
              <div className="space-y-4">
                {relatedVideos.map(relatedVideo => (
                  <div key={relatedVideo.id} className="scale-95 hover:scale-100 transition-transform">
                    <VideoCard
                      video={relatedVideo}
                      onWishlistToggle={addToWishlist}
                      isInWishlist={isInWishlist(relatedVideo.id)}
                      showCreator={false}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}