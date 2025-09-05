import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Filter, Grid, List } from 'lucide-react';
import { VideoCard } from '../components/VideoCard';
import { Breadcrumb } from '../components/Layout/Breadcrumb';
import { useVideoDatabase } from '../hooks/useVideoDatabase';
import { VideoService } from '../services/VideoService';
import { categories } from '../data/constants';
import { Video } from '../types';
import toast from 'react-hot-toast';

export function WishlistPage() {
  const { 
    wishlist, 
    addToWishlist, 
    loading 
  } = useVideoDatabase();
  const [wishlistVideos, setWishlistVideos] = useState<Video[]>([]);
  const [sortBy, setSortBy] = useState('recent');
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadingVideos, setLoadingVideos] = useState(false);

  useEffect(() => {
    loadWishlistVideos();
  }, [wishlist]);

  const loadWishlistVideos = async () => {
    if (wishlist.length === 0) {
      setWishlistVideos([]);
      return;
    }

    setLoadingVideos(true);
    try {
      const videoPromises = wishlist.map(id => VideoService.getVideoById(id));
      const videos = await Promise.all(videoPromises);
      const validVideos = videos.filter((video): video is Video => video !== null);
      setWishlistVideos(validVideos);
    } catch (error) {
      toast.error('Failed to load wishlist videos');
      console.error('Error loading wishlist videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };
  
  const filteredAndSortedVideos = wishlistVideos
    .filter(video => filterCategory === 'All' || video.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return b.views - a.views;
        case 'duration':
          return a.duration.localeCompare(b.duration);
        case 'likes':
          return b.likes - a.likes;
        default: // recent
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });

  const clearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        const removePromises = wishlist.map(videoId => addToWishlist(videoId));
        await Promise.all(removePromises);
        toast.success('Wishlist cleared');
      } catch (error) {
        toast.error('Failed to clear wishlist');
      }
    }
  };

  const getCategoryCounts = () => {
    const counts: { [key: string]: number } = {};
    wishlistVideos.forEach(video => {
      counts[video.category] = (counts[video.category] || 0) + 1;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Breadcrumb showBackButton backPath="/" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              <h1 className="text-3xl font-bold">My Wishlist</h1>
              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                {wishlistVideos.length} videos
              </span>
            </div>

            {wishlistVideos.length > 0 && (
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={clearWishlist}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          {wishlistVideos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-500">{wishlistVideos.length}</div>
                <div className="text-sm text-gray-400">Total Videos</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-500">
                  {Math.round(wishlistVideos.reduce((acc, video) => acc + video.views, 0) / 1000000)}M
                </div>
                <div className="text-sm text-gray-400">Total Views</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-500">
                  {Object.keys(categoryCounts).length}
                </div>
                <div className="text-sm text-gray-400">Categories</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-500">
                  {wishlistVideos.reduce((acc, video) => acc + video.likes, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Likes</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Filters and Controls */}
        {wishlistVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              >
                <option value="All">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category} ({categoryCounts[category] || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-400">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              >
                <option value="recent">Recently Added</option>
                <option value="title">Title (A-Z)</option>
                <option value="views">Most Views</option>
                <option value="likes">Most Likes</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {loading || loadingVideos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-800 rounded-lg aspect-video mb-4"></div>
                <div className="bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-700 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : wishlistVideos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Heart className="h-24 w-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start adding videos to your wishlist by clicking the heart icon on any video you'd like to watch later.
            </p>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Explore Videos
            </motion.a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredAndSortedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={viewMode === 'list' ? 'bg-gray-800 rounded-lg p-4 flex items-center space-x-4' : ''}
              >
                {viewMode === 'grid' ? (
                  <VideoCard
                    video={video}
                    onWishlistToggle={addToWishlist}
                    isInWishlist={true}
                  />
                ) : (
                  <div className="flex items-center space-x-4 w-full">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{video.title}</h3>
                      <p className="text-sm text-gray-400 truncate">{video.creator.name}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{video.views.toLocaleString()} views</span>
                        <span>{video.duration}</span>
                        <span className="bg-gray-700 px-2 py-1 rounded">{video.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToWishlist(video.id)}
                      className="p-2 text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
