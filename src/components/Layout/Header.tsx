import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, User, Heart, Video, Menu, X, LogOut, LogIn, Upload, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useVideoRefresh } from '../../contexts/VideoContext';
import { AuthModal } from '../Auth/AuthModal';
import { VideoUploadModal } from '../VideoUpload/VideoUploadModal';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onVideoUploaded?: () => void;
}

export function Header({ onSearch, onVideoUploaded }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { triggerRefresh } = useVideoRefresh();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      setIsAuthModalOpen(true);
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const publicNavigationItems = [
    { icon: Home, label: 'Home', path: '/' },
  ];

  const privateNavigationItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Video, label: 'Dashboard', path: '/dashboard' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  const navigationItems = isAuthenticated ? privateNavigationItems : publicNavigationItems;

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Play className="h-8 w-8 text-green-500" />
            <span className="text-xl font-bold text-white">SlimeTube</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full bg-gray-800 text-white rounded-full py-2 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-gray-700 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
            
            {/* Upload Button - Only for authenticated users */}
            {isAuthenticated && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">Upload</span>
              </button>
            )}
            
            {/* Auth Button */}
            <button
              onClick={handleAuthAction}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm">Login</span>
                </>
              )}
            </button>
            
            {/* User Avatar */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-2">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border-2 border-gray-700"
                />
                <span className="text-sm text-gray-300">{user.name}</span>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="w-full bg-gray-800 text-white rounded-full py-2 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-gray-700 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gray-800 border-t border-gray-700"
          >
            <nav className="px-4 py-4 space-y-2">
              {navigationItems.map(({ icon: Icon, label, path }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(path)
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
              
              {/* Mobile Auth Button */}
              <button
                onClick={handleAuthAction}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-300 hover:text-white hover:bg-gray-700 w-full"
              >
                {isAuthenticated ? (
                  <>
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Login</span>
                  </>
                )}
              </button>
              
              {/* Mobile User Info */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-3 px-3 py-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border-2 border-gray-700"
                  />
                  <span className="text-gray-300">{user.name}</span>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      
      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onVideoUploaded={() => {
          // Trigger refresh across the app
          triggerRefresh();
          // Call the refresh callback if provided
          if (onVideoUploaded) {
            onVideoUploaded();
          }
        }}
      />
    </header>
  );
}