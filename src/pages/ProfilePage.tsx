import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Edit3, Settings, Eye, Heart, Clock, Trophy } from 'lucide-react';
import { Breadcrumb } from '../components/Layout/Breadcrumb';
import { VideoCard } from '../components/VideoCard';
import { useAuth } from '../contexts/AuthContext';
import { useVideoDatabase } from '../hooks/useVideoDatabase';
import { UserService } from '../services/UserService';
import { VideoService } from '../services/VideoService';
import { Video } from '../types';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { 
    wishlist, 
    watchHistory, 
    addToWishlist, 
    isInWishlist 
  } = useVideoDatabase();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'watchHistory' | 'settings'>('overview');
  const [recentWatchedVideos, setRecentWatchedVideos] = useState<Video[]>([]);
  const [favoriteVideos, setFavoriteVideos] = useState<Video[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user) {
      loadRecentVideos();
      loadFavoriteVideos();
    }
  }, [user, watchHistory, wishlist]);

  const loadRecentVideos = async () => {
    if (watchHistory.length === 0) return;
    
    try {
      const recentIds = watchHistory.slice(0, 6);
      const videoPromises = recentIds.map(id => VideoService.getVideoById(id));
      const videos = await Promise.all(videoPromises);
      const validVideos = videos.filter((video): video is Video => video !== null);
      setRecentWatchedVideos(validVideos);
    } catch (error) {
      console.error('Error loading recent videos:', error);
    }
  };

  const loadFavoriteVideos = async () => {
    if (wishlist.length === 0) return;
    
    try {
      const favoriteIds = wishlist.slice(0, 6);
      const videoPromises = favoriteIds.map(id => VideoService.getVideoById(id));
      const videos = await Promise.all(videoPromises);
      const validVideos = videos.filter((video): video is Video => video !== null);
      setFavoriteVideos(validVideos);
    } catch (error) {
      console.error('Error loading favorite videos:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      // In a real app, this would update the user profile via API
      await UserService.updateUserProfile(user.id, {
        ...user,
        name: editedUser.name,
        email: editedUser.email
      });
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p className="text-gray-400">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      icon: Eye, 
      label: 'Videos Watched', 
      value: watchHistory.length,
      color: 'text-blue-500'
    },
    { 
      icon: Heart, 
      label: 'Favorites', 
      value: wishlist.length,
      color: 'text-red-500'
    },
    { 
      icon: Clock, 
      label: 'Hours Watched', 
      value: Math.floor(watchHistory.length * 0.75), // Estimated
      color: 'text-green-500'
    },
    { 
      icon: Trophy, 
      label: 'Achievement Level', 
      value: Math.min(Math.floor(watchHistory.length / 10) + 1, 10),
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Breadcrumb showBackButton backPath="/" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-gray-700"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-gray-800 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4 max-w-md">
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    placeholder="Full Name"
                  />
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    placeholder="Email Address"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                  <p className="text-gray-400 mb-4">{user.email}</p>
                  <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-700">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'watchHistory', label: 'Watch History' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Watch History */}
              {recentWatchedVideos.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Recently Watched</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentWatchedVideos.map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        onWishlistToggle={addToWishlist}
                        isInWishlist={isInWishlist(video.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Videos */}
              {favoriteVideos.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Favorite Videos</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteVideos.map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        onWishlistToggle={addToWishlist}
                        isInWishlist={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {recentWatchedVideos.length === 0 && favoriteVideos.length === 0 && (
                <div className="text-center py-20">
                  <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
                  <p className="text-gray-400 mb-6">
                    Begin watching videos and adding favorites to see your activity here.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Explore Videos
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'watchHistory' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Complete Watch History</h2>
              {watchHistory.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-400 mb-4">
                    You've watched {watchHistory.length} videos
                  </p>
                  {/* This would show the full watch history */}
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Full watch history feature coming soon!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Watch History</h3>
                  <p className="text-gray-400">
                    Start watching videos to build your history.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Member Since</label>
                      <input
                        type="text"
                        value={new Date().toLocaleDateString()}
                        disabled
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Autoplay videos</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email notifications</span>
                      <input type="checkbox" className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dark mode</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h3>
                  <p className="text-gray-400 mb-4">
                    Once you delete your account, there is no going back.
                  </p>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
