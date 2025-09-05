import { User } from '../types';

class UserServiceClass {
  async getUserProfile(userId: string): Promise<User> {
    try {
      // In production, replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // return data.user;

      // For development, simulate API call
      await this.simulateApiDelay();
      
      // Return mock user data
      return this.getMockUser(userId);
    } catch (error) {
      throw new Error('Failed to fetch user profile');
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // In production, replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}` 
      //   },
      //   body: JSON.stringify(updates)
      // });
      // const data = await response.json();
      // return data.user;

      // For development, simulate API call
      await this.simulateApiDelay();
      
      const currentUser = this.getMockUser(userId);
      return { ...currentUser, ...updates };
    } catch (error) {
      throw new Error('Failed to update user profile');
    }
  }

  async getUserWishlist(userId: string): Promise<string[]> {
    try {
      // In production, replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // return data.wishlist;

      // For development, simulate API call
      await this.simulateApiDelay();
      
      // Get from localStorage or return empty array
      const savedWishlist = localStorage.getItem(`wishlist_${userId}`);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      throw new Error('Failed to fetch wishlist');
    }
  }

  async addToWishlist(userId: string, videoId: string): Promise<void> {
    try {
      // In production, replace with actual API call:
      // await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}` 
      //   },
      //   body: JSON.stringify({ videoId })
      // });

      // For development, simulate API call and use localStorage
      await this.simulateApiDelay(200);
      
      const wishlist = await this.getUserWishlist(userId);
      if (!wishlist.includes(videoId)) {
        wishlist.push(videoId);
        localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));
      }
    } catch (error) {
      throw new Error('Failed to add to wishlist');
    }
  }

  async removeFromWishlist(userId: string, videoId: string): Promise<void> {
    try {
      // In production, replace with actual API call:
      // await fetch(`${API_BASE_URL}/users/${userId}/wishlist/${videoId}`, {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });

      // For development, simulate API call and use localStorage
      await this.simulateApiDelay(200);
      
      const wishlist = await this.getUserWishlist(userId);
      const updatedWishlist = wishlist.filter(id => id !== videoId);
      localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updatedWishlist));
    } catch (error) {
      throw new Error('Failed to remove from wishlist');
    }
  }

  async getWatchHistory(userId: string): Promise<string[]> {
    try {
      // In production, replace with actual API call:
      // const response = await fetch(`${API_BASE_URL}/users/${userId}/watch-history`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // return data.watchHistory;

      // For development, simulate API call
      await this.simulateApiDelay();
      
      // Get from localStorage or return empty array
      const savedHistory = localStorage.getItem(`watchHistory_${userId}`);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      throw new Error('Failed to fetch watch history');
    }
  }

  async addToWatchHistory(userId: string, videoId: string): Promise<void> {
    try {
      // In production, replace with actual API call:
      // await fetch(`${API_BASE_URL}/users/${userId}/watch-history`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}` 
      //   },
      //   body: JSON.stringify({ videoId })
      // });

      // For development, simulate API call and use localStorage
      await this.simulateApiDelay(100);
      
      const history = await this.getWatchHistory(userId);
      // Remove if already exists (to move to front)
      const filteredHistory = history.filter(id => id !== videoId);
      // Add to beginning
      const updatedHistory = [videoId, ...filteredHistory].slice(0, 50); // Keep last 50
      localStorage.setItem(`watchHistory_${userId}`, JSON.stringify(updatedHistory));
    } catch (error) {
      throw new Error('Failed to add to watch history');
    }
  }

  private getMockUser(userId: string): User {
    return {
      id: userId,
      name: 'Demo User',
      email: 'demo@streamflix.com',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      watchedVideos: [],
      wishlist: [],
      preferences: {
        theme: 'dark',
        autoplay: true,
        quality: '1080p'
      },
      createdAt: '2024-01-01',
      lastLogin: new Date().toISOString()
    };
  }

  private async simulateApiDelay(ms: number = 600): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const UserService = new UserServiceClass();
