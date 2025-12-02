/**
 * Mini Audio Player Component
 * Compact audio player for release cards
 */

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface MiniPlayerProps {
  audioUrl?: string
  title?: string
  artist?: string
  className?: string
}

export function MiniPlayer({ audioUrl, title, artist, className = "" }: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // If no audio URL, show placeholder
  if (!audioUrl) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Play className="w-4 h-4 text-white/40" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/60 truncate">
            {title || "Preview no disponible"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-2 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Progress Bar */}
      <div className="relative h-1 bg-white/10 rounded-full mb-2 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[#00F9FF] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-[#00F9FF]/20 hover:bg-[#00F9FF]/30 flex items-center justify-center transition-colors group"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-[#00F9FF] group-hover:scale-110 transition-transform" />
          ) : (
            <Play className="w-4 h-4 text-[#00F9FF] ml-0.5 group-hover:scale-110 transition-transform" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/90 font-medium truncate">
            {title || "Sin título"}
          </div>
          {artist && (
            <div className="text-xs text-white/60 truncate">
              {artist}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
          
          <span className="text-xs text-white/50 font-mono min-w-[35px] text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}

