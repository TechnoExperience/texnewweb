import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  Check,
  RotateCcw,
  Crop,
  Download
} from 'lucide-react';
import useStorageUpload from '../../hooks/useStorageUpload';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  currentImage?: string;
  maxSize?: number; // MB
  allowedTypes?: string[];
  resize?: {
    width: number;
    height: number;
    quality?: number;
  };
  folder?: string;
  className?: string;
  label?: string;
  multiple?: boolean;
  showPreview?: boolean;
  showProgress?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onError,
  currentImage,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  resize,
  folder = 'uploads',
  className = '',
  label = 'Subir imagen',
  multiple = false,
  showPreview = true,
  showProgress = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { uploadFile, uploading, progress } = useStorageUpload();

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Crear preview inmediatamente
    if (file.type.startsWith('image/') && showPreview) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const result = await uploadFile(file, {
        folder,
        maxSize,
        allowedTypes,
        resize
      });

      if (result.success && result.url) {
        setUploadStatus('success');
        onUpload(result.url);
        
        // Actualizar preview con la URL final
        if (showPreview) {
          setPreview(result.url);
        }
      } else {
        setUploadStatus('error');
        setErrorMessage(result.error || 'Error al subir la imagen');
        if (onError) onError(result.error || 'Error al subir la imagen');
        
        // Revertir preview en caso de error
        setPreview(currentImage || null);
      }
    } catch (error) {
      setUploadStatus('error');
      const errorMsg = `Error inesperado: ${error}`;
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
      setPreview(currentImage || null);
    }
  }, [uploadFile, folder, maxSize, allowedTypes, resize, onUpload, onError, currentImage, showPreview]);

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
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="p-8 text-center">
          {/* Preview */}
          {preview && showPreview ? (
            <div className="relative inline-block mb-4">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-32 object-cover brutal-border border-gray-dark"
              />
              {!uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <ImageIcon className="w-12 h-12 text-gray-light mx-auto mb-2" />
            </div>
          )}

          {/* Status & Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              {getStatusIcon()}
              <span className="text-white font-space text-sm">
                {uploadStatus === 'uploading' 
                  ? 'Subiendo...' 
                  : uploadStatus === 'success'
                  ? 'Subida exitosa'
                  : uploadStatus === 'error'
                  ? 'Error al subir'
                  : preview
                  ? 'Cambiar imagen'
                  : 'Arrastra tu imagen aquí o haz clic para seleccionar'
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
                {resize && (
                  <p>Se redimensionará a {resize.width}x{resize.height}px</p>
                )}
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

export default ImageUpload; 