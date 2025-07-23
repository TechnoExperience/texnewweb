import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { MusicTrack } from '../data/types';

interface MusicPlayerContextType {
  currentTrack: MusicTrack | null;
  isPlayerVisible: boolean;
  isPlaying: boolean;
  playlist: MusicTrack[];
  setCurrentTrack: (track: MusicTrack) => void;
  setPlaylist: (tracks: MusicTrack[]) => void;
  showPlayer: () => void;
  hidePlayer: () => void;
  togglePlayer: () => void;
  playTrack: (track: MusicTrack, playlist?: MusicTrack[]) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);

  const showPlayer = () => setIsPlayerVisible(true);
  const hidePlayer = () => setIsPlayerVisible(false);
  const togglePlayer = () => setIsPlayerVisible(!isPlayerVisible);

  const playTrack = (track: MusicTrack, newPlaylist?: MusicTrack[]) => {
    setCurrentTrack(track);
    if (newPlaylist) {
      setPlaylist(newPlaylist);
    }
    setIsPlaying(true);
    showPlayer();
  };

  const value: MusicPlayerContextType = {
    currentTrack,
    isPlayerVisible,
    isPlaying,
    playlist,
    setCurrentTrack,
    setPlaylist,
    showPlayer,
    hidePlayer,
    togglePlayer,
    playTrack
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

export default MusicPlayerContext; 