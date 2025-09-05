import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { indexedDBStorage } from '../../services/IndexedDBStorageService';

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export function VideoPlayer({ videoUrl, poster, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>('');

  // Sample video URLs for demonstration (these are publicly available test videos)
  const sampleVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubpoenaFormerEscapes.mp4'
  ];

  // Get a working video URL (for demo purposes, use sample videos)
  const getVideoUrl = async (originalUrl: string): Promise<string> => {
    console.log('getVideoUrl called with:', originalUrl);
    
    // If the original URL starts with stored:// (our persistent storage), retrieve it
    if (originalUrl.startsWith('stored://')) {
      const videoId = originalUrl.replace('stored://', '');
      console.log('Extracting video ID:', videoId);
      const blobUrl = await indexedDBStorage.getStoredVideoUrl(videoId);
      console.log('Retrieved blob URL from storage:', blobUrl);
      return blobUrl || sampleVideos[0]; // Fallback to sample if not found
    }
    
    // If the original URL starts with blob: (uploaded file), use it directly
    if (originalUrl.startsWith('blob:')) {
      return originalUrl;
    }
    
    // If it's a regular HTTP URL, use it directly
    if (originalUrl.startsWith('http')) {
      return originalUrl;
    }
    
    // For demo purposes, return a random sample video for other cases
    const randomIndex = Math.floor(Math.random() * sampleVideos.length);
    return sampleVideos[randomIndex];
  };

  const workingVideoUrl = resolvedVideoUrl;

  // Resolve video URL when videoUrl prop changes
  useEffect(() => {
    const resolveVideoUrl = async () => {
      setIsLoading(true);
      try {
        console.log('VideoPlayer: Resolving video URL:', videoUrl);
        const url = await getVideoUrl(videoUrl);
        console.log('VideoPlayer: Resolved to:', url);
        console.log('VideoPlayer: Poster URL:', poster);
        setResolvedVideoUrl(url);
      } catch (error) {
        console.error('Failed to resolve video URL:', error);
        setResolvedVideoUrl(sampleVideos[0]); // Fallback
      }
    };

    resolveVideoUrl();
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      setCurrentTime(current);
      if (onTimeUpdate) {
        onTimeUpdate(current, total);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      setVideoError(null);
      // Ensure volume is set correctly
      video.volume = volume;
      video.muted = isMuted;
    };

    const handleError = () => {
      setVideoError('Failed to load video. Please try again later.');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setVideoError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onTimeUpdate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const vol = parseFloat(e.target.value) / 100;
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error Message */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg mb-2">Video Unavailable</p>
            <p className="text-sm text-gray-400">{videoError}</p>
            <button 
              onClick={() => {
                setVideoError(null);
                setIsLoading(true);
                videoRef.current?.load();
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={workingVideoUrl}
        poster={poster}
        className="w-full aspect-video"
        onClick={togglePlay}
        preload="metadata"
        crossOrigin="anonymous"
        controls={false}
        muted={false}
        playsInline
      />

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"
          >
            {/* Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="bg-black bg-opacity-50 rounded-full p-4 text-white hover:bg-opacity-70 transition-opacity"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(currentTime / duration) * 100 || 0}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  
                  <button
                    onClick={() => skip(-10)}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => skip(10)}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-red-400 transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume * 100}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-white hover:text-red-400 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    
                    {showSettings && (
                      <div className="absolute bottom-8 right-0 bg-gray-800 rounded-lg p-3 min-w-[120px]">
                        <div className="text-white text-sm mb-2">Quality</div>
                        <select
                          value={quality}
                          onChange={(e) => setQuality(e.target.value)}
                          className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1"
                        >
                          <option value="4K">4K</option>
                          <option value="1080p">1080p</option>
                          <option value="720p">720p</option>
                          <option value="480p">480p</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}