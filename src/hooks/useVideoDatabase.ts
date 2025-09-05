import { useState, useEffect } from 'react';
import { Video, SearchResult, VideoFilter } from '../types';
import { VideoService } from '../services/VideoService';
import { UserService } from '../services/UserService';
import { useAuth } from '../contexts/AuthContext';
import { useVideoRefresh } from '../contexts/VideoContext';
import toast from 'react-hot-toast';

export function useVideoDatabase() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [watchHistory, setWatchHistory] = useState<string[]>([]);
  const { user, isAuthenticated } = useAuth();
  const { refreshTrigger } = useVideoRefresh();

  // Load initial data
  useEffect(() => {
    loadVideos();
  }, []);

  // Refresh videos when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadVideos();
    }
  }, [refreshTrigger]);

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      setWishlist([]);
      setWatchHistory([]);
    }
  }, [isAuthenticated, user]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await VideoService.getAllVideos();
      setVideos(data);
    } catch (error) {
      toast.error('Failed to load videos');
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [userWishlist, userHistory] = await Promise.all([
        UserService.getUserWishlist(user.id),
        UserService.getWatchHistory(user.id)
      ]);
      setWishlist(userWishlist);
      setWatchHistory(userHistory);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const searchVideos = async (query: string, filters?: VideoFilter): Promise<SearchResult> => {
    setLoading(true);
    try {
      const result = await VideoService.searchVideos(query, filters);
      return result;
    } catch (error) {
      toast.error('Search failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getVideoById = async (id: string): Promise<Video | null> => {
    try {
      return await VideoService.getVideoById(id);
    } catch (error) {
      toast.error('Failed to load video');
      return null;
    }
  };

  const getVideosByCategory = async (category: string): Promise<Video[]> => {
    setLoading(true);
    try {
      const data = await VideoService.getVideosByCategory(category);
      return data;
    } catch (error) {
      toast.error('Failed to load videos by category');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTrendingVideos = async (): Promise<Video[]> => {
    try {
      return await VideoService.getTrendingVideos();
    } catch (error) {
      toast.error('Failed to load trending videos');
      return [];
    }
  };

  const getRecommendedVideos = async (): Promise<Video[]> => {
    if (!user) return [];
    
    try {
      return await VideoService.getRecommendedVideos(user.id);
    } catch (error) {
      console.error('Failed to load recommended videos:', error);
      return [];
    }
  };

  const addToWishlist = async (videoId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to add videos to wishlist');
      return;
    }

    try {
      const isInWishlist = wishlist.includes(videoId);
      
      if (isInWishlist) {
        await UserService.removeFromWishlist(user.id, videoId);
        setWishlist(prev => prev.filter(id => id !== videoId));
        toast.success('Removed from wishlist');
      } else {
        await UserService.addToWishlist(user.id, videoId);
        setWishlist(prev => [...prev, videoId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
      console.error('Error updating wishlist:', error);
    }
  };

  const addToWatchHistory = async (videoId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      await UserService.addToWatchHistory(user.id, videoId);
      setWatchHistory(prev => {
        const filtered = prev.filter(id => id !== videoId);
        return [videoId, ...filtered].slice(0, 50);
      });
    } catch (error) {
      console.error('Error adding to watch history:', error);
    }
  };

  const likeVideo = async (videoId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to like videos');
      return;
    }

    try {
      await VideoService.likeVideo(videoId, user.id);
      // Update local video data
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, likes: video.likes + 1 }
          : video
      ));
      toast.success('Video liked!');
    } catch (error) {
      toast.error('Failed to like video');
      console.error('Error liking video:', error);
    }
  };

  const incrementViews = async (videoId: string) => {
    try {
      await VideoService.incrementViews(videoId);
      // Update local video data
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, views: video.views + 1 }
          : video
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  return {
    videos,
    loading,
    wishlist,
    watchHistory,
    searchVideos,
    getVideoById,
    getVideosByCategory,
    getTrendingVideos,
    getRecommendedVideos,
    addToWishlist,
    addToWatchHistory,
    likeVideo,
    incrementViews,
    refreshVideos: loadVideos, // Add refresh function
    isInWishlist: (videoId: string) => wishlist.includes(videoId),
    isInWatchHistory: (videoId: string) => watchHistory.includes(videoId),
    categories: VideoService.getCategories(),
  };
}
