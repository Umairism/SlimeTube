import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Heart, 
  Play, 
  Star,
  Calendar,
  Filter
} from 'lucide-react';
import { VideoCard } from '../components/VideoCard';
import { Breadcrumb } from '../components/Layout/Breadcrumb';
import { StorageManager } from '../components/Storage/StorageManager';
import { useVideoDatabase } from '../hooks/useVideoDatabase';
import { useAuth } from '../contexts/AuthContext';
import { Video } from '../types';

export const DashboardPage = () => {
  const { user } = useAuth();
  const {
    videos,
    getTrendingVideos,
    getRecommendedVideos,
    addToWishlist,
    isInWishlist,
    watchHistory,
    wishlist,
    loading
  } = useVideoDatabase();

  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [activeSection, setActiveSection] = useState<'trending' | 'recommended' | 'recent'>('trending');
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      loadTrendingVideos(),
      loadRecommendedVideos()
    ]);
  };

  const loadTrendingVideos = async () => {
    setLoadingTrending(true);
    try {
      const trending = await getTrendingVideos();
      setTrendingVideos(trending);
    } catch (error) {
      console.error('Error loading trending videos:', error);
    } finally {
      setLoadingTrending(false);
    }
  };

  const loadRecommendedVideos = async () => {
    setLoadingRecommended(true);
    try {
      const recommended = await getRecommendedVideos();
      setRecommendedVideos(recommended);
    } catch (error) {
      console.error('Error loading recommended videos:', error);
    } finally {
      setLoadingRecommended(false);
    }
  };

  const getRecentVideos = () => {
    return videos.slice().sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    ).slice(0, 8);
  };

  const getDisplayVideos = () => {
    switch (activeSection) {
      case 'trending':
        return trendingVideos;
      case 'recommended':
        return recommendedVideos;
      case 'recent':
        return getRecentVideos();
      default:
        return trendingVideos;
    }
  };

  const getSectionLoading = () => {
    switch (activeSection) {
      case 'trending':
        return loadingTrending;
      case 'recommended':
        return loadingRecommended;
      case 'recent':
        return loading;
      default:
        return false;
    }
  };

  const stats = [
    {
      icon: Play,
      label: 'Videos Watched',
      value: watchHistory.length,
      color: 'bg-blue-600',
      iconColor: 'text-blue-100'
    },
    {
      icon: Heart,
      label: 'Favorites',
      value: wishlist.length,
      color: 'bg-red-600',
      iconColor: 'text-red-100'
    },
    {
      icon: Clock,
      label: 'Watch Time',
      value: `${Math.floor(watchHistory.length * 0.75)}h`,
      color: 'bg-green-600',
      iconColor: 'text-green-100'
    },
    {
      icon: Star,
      label: 'Level',
      value: Math.min(Math.floor(watchHistory.length / 10) + 1, 10),
      color: 'bg-yellow-600',
      iconColor: 'text-yellow-100'
    }
  ];

  const sections = [
    {
      id: 'trending',
      label: 'Trending',
      icon: TrendingUp,
      description: 'Most popular videos right now'
    },
    {
      id: 'recommended',
      label: 'For You',
      icon: Star,
      description: 'Personalized recommendations'
    },
    {
      id: 'recent',
      label: 'Latest',
      icon: Calendar,
      description: 'Recently uploaded videos'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Breadcrumb showBackButton backPath="/" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            {user?.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-gray-700"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-400">
                Discover amazing content curated just for you
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.color} rounded-lg p-6`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/search"
              className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Explore Videos</h3>
                <p className="text-sm text-gray-400">Find new content</p>
              </div>
            </a>
            
            <a
              href="/wishlist"
              className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">My Wishlist</h3>
                <p className="text-sm text-gray-400">{wishlist.length} videos saved</p>
              </div>
            </a>
            
            <a
              href="/profile"
              className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">My Profile</h3>
                <p className="text-sm text-gray-400">View activity</p>
              </div>
            </a>
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-colors ${
                  activeSection === section.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <section.icon className="h-4 w-4" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            <p className="text-gray-400">
              {sections.find(s => s.id === activeSection)?.description}
            </p>
          </div>

          {/* Videos Grid */}
          {getSectionLoading() ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-800 rounded-lg aspect-video mb-4"></div>
                  <div className="bg-gray-700 h-4 rounded mb-2"></div>
                  <div className="bg-gray-700 h-3 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : getDisplayVideos().length > 0 ? (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {getDisplayVideos().map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VideoCard
                    video={video}
                    onWishlistToggle={addToWishlist}
                    isInWishlist={isInWishlist(video.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <div className="h-16 w-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const currentSection = sections.find(s => s.id === activeSection);
                  const IconComponent = currentSection?.icon;
                  return IconComponent ? <IconComponent className="h-8 w-8 text-gray-600" /> : null;
                })()}
              </div>
              <h3 className="text-xl font-semibold mb-2">No videos found</h3>
              <p className="text-gray-400 mb-6">
                Try exploring different sections or check back later.
              </p>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Browse All Videos
              </a>
            </div>
          )}
        </motion.div>

        {/* Storage Manager Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <StorageManager />
        </motion.div>
      </div>
    </div>
  );
};
