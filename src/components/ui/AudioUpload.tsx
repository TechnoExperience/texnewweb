import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Music, 
  Loader2, 
  AlertCircle, 
  Check,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import useAudioUpload from '../../hooks/useAudioUpload';

interface AudioUploadProps {
  onUpload: (url: string, duration: number) => void;
  onError?: (error: string) => void;
  currentAudio?: string;
  maxSize?: number; // MB
  allowedTypes?: string[];
  folder?: string;
  className?: string;
  label?: string;
  showPreview?: boolean;
  showProgress?: boolean;
}

const AudioUpload: React.FC<AudioUploadProps> = ({
  onUpload,
  onError,
  currentAudio,
  maxSize = 50,
  allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac'],
  folder = 'tracks',
  className = '',
  label = 'Subir archivo de audio',
  showPreview = true,
  showProgress = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAudio || null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioInfo, setAudioInfo] = useState<{
    name: string;
    size: string;
    duration: string;
  } | null>(null);

  const { uploadAudio, uploading, progress } = useAudioUpload();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const MB = bytes / (1024 * 1024);
    return `${MB.toFixed(1)} MB`;
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Crear preview y obtener info del archivo
    if (file.type.startsWith('audio/') && showPreview) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      // Obtener información del archivo
      const audio = new Audio(previewUrl);
      audio.onloadedmetadata = () => {
        setAudioInfo({
          name: file.name,
          size: formatFileSize(file.size),
          duration: formatTime(audio.duration)
        });
        setDuration(audio.duration);
      };
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const result = await uploadAudio(file, {
        folder,
        maxSize,
        allowedTypes
      });

      if (result.success && result.url) {
        setUploadStatus('success');
        onUpload(result.url, result.duration || 0);
        
        // Actualizar preview con la URL final
        if (showPreview) {
          setPreview(result.url);
        }
      } else {
        setUploadStatus('error');
        setErrorMessage(result.error || 'Error al subir el archivo de audio');
        if (onError) onError(result.error || 'Error al subir el archivo de audio');
        
        // Revertir preview en caso de error
        setPreview(currentAudio || null);
        setAudioInfo(null);
      }
    } catch (error) {
      setUploadStatus('error');
      const errorMsg = `Error inesperado: ${error}`;
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
      setPreview(currentAudio || null);
      setAudioInfo(null);
    }
  }, [uploadAudio, folder, maxSize, allowedTypes, onUpload, onError, currentAudio, showPreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setAudioInfo(null);
    setUploadStatus('idle');
    setErrorMessage('');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !preview) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin text-neon-mint" />;
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Upload className="w-5 h-5 text-gray-light" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'border-neon-mint';
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      default:
        return dragOver ? 'border-neon-mint' : 'border-gray-dark';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-white font-space text-sm mb-2">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed transition-all duration-300 brutal-border cursor-pointer ${getStatusColor()} ${
          dragOver ? 'bg-neon-mint bg-opacity-10' : 'bg-gray-dark bg-opacity-30'
        } ${uploading ? 'pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="p-8 text-center">
          {/* Audio Preview */}
          {preview && showPreview ? (
            <div className="space-y-4">
              {/* Audio Element (hidden) */}
              <audio
                ref={audioRef}
                src={preview}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              {/* Audio Info */}
              {audioInfo && (
                <div className="bg-black bg-opacity-50 p-4 brutal-border border-gray-600 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Music className="w-5 h-5 text-neon-mint" />
                      <span className="text-white font-space text-sm truncate">
                        {audioInfo.name}
                      </span>
                    </div>
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove();
                        }}
                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-gray-light font-space text-xs">
                    <span>{audioInfo.size}</span>
                    <span>{audioInfo.duration}</span>
                  </div>

                  {/* Mini Player */}
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="w-8 h-8 bg-neon-mint text-black rounded-full flex items-center justify-center hover:bg-neon-cyan transition-colors"
                      disabled={uploading}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    
                    <div className="flex-1 bg-gray-dark h-1 brutal-border border-gray-600">
                      <div
                        className="h-full bg-neon-mint transition-all duration-100"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    
                    <span className="text-gray-light font-space text-xs min-w-[45px]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <Music className="w-12 h-12 text-gray-light mx-auto mb-2" />
            </div>
          )}

          {/* Status & Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              {getStatusIcon()}
              <span className="text-white font-space text-sm">
                {uploadStatus === 'uploading' 
                  ? 'Subiendo archivo de audio...' 
                  : uploadStatus === 'success'
                  ? 'Subida exitosa'
                  : uploadStatus === 'error'
                  ? 'Error al subir'
                  : preview
                  ? 'Cambiar archivo de audio'
                  : 'Arrastra tu archivo de audio aquí o haz clic para seleccionar'
                }
              </span>
            </div>

            {/* Progress Bar */}
            {showProgress && uploading && (
              <div className="w-full bg-gray-dark brutal-border border-gray-600 h-2">
                <div
                  className="h-full bg-neon-mint transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Error Message */}
            {uploadStatus === 'error' && errorMessage && (
              <p className="text-red-300 font-space text-xs">
                {errorMessage}
              </p>
            )}

            {/* File Requirements */}
            {uploadStatus === 'idle' && !preview && (
              <div className="text-gray-light font-space text-xs space-y-1">
                <p>Tamaño máximo: {maxSize}MB</p>
                <p>Formatos: {allowedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()}</p>
                <p>Duración recomendada: 2-10 minutos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {preview && uploadStatus !== 'uploading' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRemove}
              className="px-3 py-1 bg-red-500 text-white font-space text-xs hover:bg-red-600 transition-colors"
            >
              Eliminar
            </button>
            
            <button
              onClick={handleClick}
              className="px-3 py-1 bg-gray-dark text-white font-space text-xs hover:bg-gray-600 transition-colors border border-gray-600"
            >
              Cambiar
            </button>
          </div>

          {uploadStatus === 'success' && (
            <div className="flex items-center space-x-1 text-green-500 font-space text-xs">
              <Check className="w-3 h-3" />
              <span>Guardado</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioUpload; 