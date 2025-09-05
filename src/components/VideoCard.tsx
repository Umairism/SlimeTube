import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onWishlistToggle?: (videoId: string) => void;
  isInWishlist?: boolean;
  showCreator?: boolean;
}

export function VideoCard({ 
  video, 
  onWishlistToggle, 
  isInWishlist = false, 
  showCreator = true 
}: VideoCardProps) {
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Link to={`/video/${video.id}`}>
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{video.duration}</span>
            </div>
          </div>
          
          {/* Quality Badge */}
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            {video.quality[0]}
          </div>
        </Link>
        
        {/* Wishlist Button */}
        {onWishlistToggle && (
          <button
            onClick={() => onWishlistToggle(video.id)}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              isInWishlist
                ? 'bg-red-600 text-white'
                : 'bg-black bg-opacity-50 text-white hover:bg-red-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/video/${video.id}`}>
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
            {video.title}
          </h3>
        </Link>
        
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {video.description}
        </p>

        {/* Creator Info */}
        {showCreator && (
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={video.creator.avatar}
              alt={video.creator.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <p className="text-white text-sm font-medium">{video.creator.name}</p>
              <p className="text-gray-500 text-xs">
                {(video.creator.subscribers / 1000000).toFixed(1)}M subscribers
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{formatViews(video.views)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(video.uploadDate)}</span>
            </div>
          </div>
          <div className="text-red-400 font-medium">
            {video.likes.toLocaleString()} likes
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {video.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
          {video.tags.length > 3 && (
            <span className="text-gray-500 text-xs">
              +{video.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}