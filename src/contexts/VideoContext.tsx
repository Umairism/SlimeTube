import React, { createContext, useContext, useState, useCallback } from 'react';

interface VideoContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

interface VideoProviderProps {
  children: React.ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <VideoContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoRefresh = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoRefresh must be used within a VideoProvider');
  }
  return context;
};
