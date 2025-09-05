export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  uploadDate: string;
  tags: string[];
  category: string;
  quality: string[];
  creator: {
    name: string;
    avatar: string;
    subscribers: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  watchedVideos: string[];
  wishlist: string[];
  preferences: {
    theme: 'dark' | 'light';
    autoplay: boolean;
    quality: string;
  };
  createdAt: string;
  lastLogin: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SearchResult {
  query: string;
  results: Video[];
  totalResults: number;
  filters: {
    category?: string;
    duration?: string;
    quality?: string;
    tags?: string[];
  };
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface VideoFilter {
  category?: string;
  tags?: string[];
  duration?: string;
  quality?: string;
  sortBy?: 'latest' | 'popular' | 'trending';
}