import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VideoCard } from '../components/VideoCard';
import { useVideoDatabase } from '../hooks/useVideoDatabase';
import { categories } from '../data/constants';
import { Video } from '../types';

export function HomePage() {
  const { 
    videos, 
    loading, 
    addToWishlist, 
    isInWishlist,
    getVideosByCategory 
  } = useVideoDatabase();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    loadVideosByCategory(selectedCategory);
  }, [selectedCategory]);

  const loadVideosByCategory = async (category: string) => {
    setCategoryLoading(true);
    try {
      if (category === 'All') {
        setFilteredVideos(videos);
      } else {
        const categoryVideos = await getVideosByCategory(category);
        setFilteredVideos(categoryVideos);
      }
    } catch (error) {
      console.error('Error loading videos by category:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Update filtered videos when main videos change (for 'All' category)
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredVideos(videos);
    }
  }, [videos, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Amazing <span className="text-red-500">Videos</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Stream millions of videos from creators around the world. Find your next favorite content.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Start Watching
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {categories.map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-8">
              {selectedCategory === 'All' ? 'Trending Videos' : `${selectedCategory} Videos`}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(categoryLoading || loading) ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-800 rounded-lg aspect-video mb-4"></div>
                    <div className="bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-700 h-3 rounded w-3/4"></div>
                  </div>
                ))
              ) : filteredVideos.length > 0 ? (
                filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <VideoCard
                      video={video}
                      onWishlistToggle={addToWishlist}
                      isInWishlist={isInWishlist(video.id)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400 text-lg">
                    No videos found in {selectedCategory} category.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}