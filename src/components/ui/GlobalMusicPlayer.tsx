import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { MusicTrack } from '../../data/types';

interface GlobalMusicPlayerProps {
  isVisible: boolean;
  onClose: () => void;
}

const GlobalMusicPlayer: React.FC<GlobalMusicPlayerProps> = ({ isVisible, onClose }) => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Cargar tracks desde Supabase
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const { data: tracks, error } = await supabase
        .from('music_tracks')
        .select(`
          *,
          artist:artists(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tracks:', error);
        return;
      }

      setPlaylist(tracks || []);
      if (tracks && tracks.length > 0 && !currentTrack) {
        setCurrentTrack(tracks[0]);
      }
    } catch (error) {
      console.error('Error in loadTracks:', error);
    }
  };

  // Actualizar tiempo actual
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, [currentTrack]);

  const handleTrackEnd = () => {
    if (isRepeat) {
      playTrack(currentTrack);
    } else {
      nextTrack();
    }
  };

  const playTrack = (track: MusicTrack | null) => {
    if (!track || !audioRef.current) return;

    setCurrentTrack(track);
    audioRef.current.src = track.file_url;
    audioRef.current.load();
    audioRef.current.play();
    setIsPlaying(true);

    // Incrementar play count
    supabase
      .from('music_tracks')
      .update({ play_count: (track.play_count || 0) + 1 })
      .eq('id', track.id);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;

    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    setCurrentIndex(nextIndex);
    playTrack(playlist[nextIndex]);
  };

  const previousTrack = () => {
    if (playlist.length === 0) return;

    let prevIndex;
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    }

    setCurrentIndex(prevIndex);
    playTrack(playlist[prevIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible || !currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-darkest border-t border-gray-600 z-50">
      <audio ref={audioRef} />
      
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gray-600 brutal-border flex-shrink-0">
              {currentTrack.cover_image_url ? (
                <img
                  src={currentTrack.cover_image_url}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">♪</span>
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-space text-sm truncate">
                {currentTrack.title}
              </h4>
              <p className="text-gray-light text-xs truncate">
                {currentTrack.artist?.name || 'Artista Desconocido'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4 flex-1 justify-center">
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={`text-gray-400 hover:text-white transition-colors ${
                isShuffled ? 'text-neon-mint' : ''
              }`}
            >
              <Shuffle size={16} />
            </button>
            
            <button
              onClick={previousTrack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-neon-mint text-black rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button
              onClick={nextTrack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward size={20} />
            </button>
            
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`text-gray-400 hover:text-white transition-colors ${
                isRepeat ? 'text-neon-mint' : ''
              }`}
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Progress & Volume */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-xs font-mono">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-gray-400 text-xs font-mono">
                {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalMusicPlayer; 