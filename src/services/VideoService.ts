import { Video, SearchResult, VideoFilter } from '../types';
import { formatUploadDate } from '../utils/videoUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class VideoServiceClass {
  private mockVideos: Video[] = [
    {
      id: '1',
      title: 'Epic Mountain Adventure Documentary',
      description: 'Join us on an incredible journey through the world\'s highest peaks. Experience breathtaking views and learn about mountain climbing techniques.',
      thumbnail: 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: '45:32',
      views: 2847593,
      likes: 85432,
      uploadDate: '2024-01-15',
      tags: ['adventure', 'documentary', 'mountains', 'nature'],
      category: 'Documentary',
      quality: ['1080p', '720p', '480p'],
      creator: {
        name: 'Adventure Seekers',
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        subscribers: 1250000
      }
    },
    {
      id: '2',
      title: 'Modern Web Development Tutorial',
      description: 'Learn the latest web development techniques using React, TypeScript, and modern tooling. Perfect for beginners and intermediate developers.',
      thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      duration: '1:23:45',
      views: 1547230,
      likes: 67891,
      uploadDate: '2024-01-20',
      tags: ['programming', 'react', 'typescript', 'tutorial'],
      category: 'Education',
      quality: ['1080p', '720p', '480p'],
      creator: {
        name: 'Code Academy Pro',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        subscribers: 890000
      }
    },
    {
      id: '3',
      title: 'Ocean Wildlife Exploration',
      description: 'Dive deep into the mysterious world of ocean wildlife. Discover amazing creatures and their habitats in this stunning underwater documentary.',
      thumbnail: 'https://images.pexels.com/photos/920161/pexels-photo-920161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: '38:17',
      views: 3245876,
      likes: 124567,
      uploadDate: '2024-02-01',
      tags: ['nature', 'ocean', 'wildlife', 'documentary'],
      category: 'Documentary',
      quality: ['4K', '1080p', '720p'],
      creator: {
        name: 'Nature Explorer',
        avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        subscribers: 2100000
      }
    }
  ];

  async getAllVideos(): Promise<Video[]> {
    try {
      // In production, replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/videos`);
      // const data = await response.json();
      // return data.videos;

      // For development, simulate API call
      await this.simulateApiDelay();
      return this.mockVideos;
    } catch (error) {
      throw new Error('Failed to fetch videos');
    }
  }

  async getVideoById(id: string): Promise<Video | null> {
    try {
      // In production, replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/videos/${id}`);
      // const data = await response.json();
      // return data.video;

      // For development, simulate API call
      await this.simulateApiDelay(300);
      return this.mockVideos.find(video => video.id === id) || null;
    } catch (error) {
      throw new Error('Failed to fetch video');
    }
  }

  async searchVideos(query: string, filters?: VideoFilter): Promise<SearchResult> {
    try {
      // In production, replace with actual API call:
      // const params = new URLSearchParams({ query, ...filters });
      // const response = await fetch(`${API_BASE_URL}/videos/search?${params}`);
      // const data = await response.json();
      // return data;

      // For development, simulate API call
      await this.simulateApiDelay(500);
      
      let filteredVideos = this.mockVideos.filter(video => {
        const matchesQuery = video.title.toLowerCase().includes(query.toLowerCase()) ||
                            video.description.toLowerCase().includes(query.toLowerCase()) ||
                            video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        if (filters?.category && filters.category !== 'All') {
          return matchesQuery && video.category === filters.category;
        }
        
        return matchesQuery;
      });

      // Apply sorting
      if (filters?.sortBy) {
        filteredVideos = this.sortVideos(filteredVideos, filters.sortBy);
      }

      return {
        query,
        results: filteredVideos,
        totalResults: filteredVideos.length,
        filters: filters || {}
      };
    } catch (error) {
      throw new Error('Failed to search videos');
    }
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    try {
      // In production, replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/videos/category/${category}`);
      // const data = await response.json();
      // return data.videos;

      // For development, simulate API call
      await this.simulateApiDelay(300);
      
      if (category === 'All') {
        return this.mockVideos;
      }
      
      return this.mockVideos.filter(video => video.category === category);
    } catch (error) {
      throw new Error('Failed to fetch videos by category');
    }
  }

  async getTrendingVideos(): Promise<Video[]> {
    try {
      // In production, replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/videos/trending`);
      // const data = await response.json();
      // return data.videos;

      // For development, simulate API call
      await this.simulateApiDelay(400);
      
      // Sort by views and return top videos
      return [...this.mockVideos]
        .sort((a, b) => b.views - a.views)
        .slice(0, 6);
    } catch (error) {
      throw new Error('Failed to fetch trending videos');
    }
  }

  async getRecommendedVideos(userId: string): Promise<Video[]> {
    try {
      // In production, replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/videos/recommended/${userId}`);
      // const data = await response.json();
      // return data.videos;

      // For development, simulate API call
      await this.simulateApiDelay(400);
      
      // Simple recommendation logic - return random videos
      const shuffled = [...this.mockVideos].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 4);
    } catch (error) {
      throw new Error('Failed to fetch recommended videos');
    }
  }

  async likeVideo(videoId: string, userId: string): Promise<void> {
    try {
      // In production, replace with actual API call:
      // await fetch(`${API_BASE_URL}/videos/${videoId}/like`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      // For development, simulate API call
      await this.simulateApiDelay(200);
      
      // Update mock data
      const video = this.mockVideos.find(v => v.id === videoId);
      if (video) {
        video.likes++;
      }
    } catch (error) {
      throw new Error('Failed to like video');
    }
  }

  async incrementViews(videoId: string): Promise<void> {
    try {
      // In production, replace with actual API call:
      // await fetch(`${API_BASE_URL}/videos/${videoId}/view`, {
      //   method: 'POST'
      // });

      // For development, simulate API call
      await this.simulateApiDelay(100);
      
      // Update mock data
      const video = this.mockVideos.find(v => v.id === videoId);
      if (video) {
        video.views++;
      }
    } catch (error) {
      throw new Error('Failed to increment views');
    }
  }

  private sortVideos(videos: Video[], sortBy: 'latest' | 'popular' | 'trending'): Video[] {
    switch (sortBy) {
      case 'latest':
        return videos.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      case 'popular':
        return videos.sort((a, b) => b.likes - a.likes);
      case 'trending':
        return videos.sort((a, b) => b.views - a.views);
      default:
        return videos;
    }
  }

  private async simulateApiDelay(ms: number = 800): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCategories(): string[] {
    return ['All', 'Documentary', 'Education', 'Entertainment', 'Music', 'Sports', 'Technology'];
  }

  async uploadVideo(videoData: Partial<Video>): Promise<Video> {
    try {
      // In production, replace with actual API call:
      // const formData = new FormData();
      // formData.append('video', videoFile);
      // formData.append('thumbnail', thumbnailFile);
      // formData.append('data', JSON.stringify(videoData));
      // const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` },
      //   body: formData
      // });
      // const data = await response.json();
      // return data.video;

      // For development, simulate upload
      await this.simulateApiDelay(2000);
      
      const newVideo: Video = {
        id: Date.now().toString(),
        title: videoData.title || '',
        description: videoData.description || '',
        thumbnail: videoData.thumbnail || '/default-thumbnail.jpg',
        videoUrl: videoData.videoUrl || '',
        duration: videoData.duration || '5:30', // Use provided duration or default
        views: 0,
        likes: 0,
        uploadDate: videoData.uploadDate || formatUploadDate(),
        tags: videoData.tags || [],
        category: videoData.category || 'Entertainment',
        quality: videoData.quality || ['1080p'],
        creator: videoData.creator || {
          name: 'Unknown Creator',
          avatar: '/default-avatar.png',
          subscribers: 0
        }
      };

      // Add to mock videos array
      this.mockVideos.unshift(newVideo);
      
      return newVideo;
    } catch (error) {
      throw new Error('Failed to upload video');
    }
  }
}

export const VideoService = new VideoServiceClass();
