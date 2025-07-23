import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AudioUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  duration?: number;
}

interface AudioUploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // en MB
  allowedTypes?: string[];
}

const useAudioUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadAudio = async (
    file: File,
    options: AudioUploadOptions = {}
  ): Promise<AudioUploadResult> => {
    const {
      bucket = 'music',
      folder = 'tracks',
      maxSize = 50, // 50MB por defecto para archivos de audio
      allowedTypes = [
        'audio/mpeg', 
        'audio/mp3', 
        'audio/wav', 
        'audio/flac', 
        'audio/aac',
        'audio/ogg'
      ]
    } = options;

    setUploading(true);
    setProgress(0);

    try {
      // Validar tipo de archivo
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
        };
      }

      // Validar tamaño
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        return {
          success: false,
          error: `El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`
        };
      }

      // Obtener duración del archivo de audio
      const duration = await getAudioDuration(file);

      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: `Error al subir archivo: ${error.message}`
        };
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setProgress(100);

      return {
        success: true,
        url: publicUrl,
        duration: duration
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: `Error inesperado: ${error}`
      };
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const deleteAudio = async (url: string, bucket: string = 'music'): Promise<boolean> => {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === bucket);
      if (bucketIndex === -1) return false;
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  const createMusicBucket = async () => {
    try {
      const { data, error } = await supabase.storage.createBucket('music', {
        public: true,
        allowedMimeTypes: [
          'audio/mpeg',
          'audio/mp3', 
          'audio/wav', 
          'audio/flac', 
          'audio/aac',
          'audio/ogg'
        ],
        fileSizeLimit: 100 * 1024 * 1024 // 100MB
      });

      if (error) {
        console.error('Create bucket error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Create bucket error:', error);
      return false;
    }
  };

  return {
    uploadAudio,
    deleteAudio,
    createMusicBucket,
    uploading,
    progress
  };
};

// Función helper para obtener duración de audio
const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    
    audio.onloadedmetadata = () => {
      window.URL.revokeObjectURL(audio.src);
      resolve(audio.duration);
    };

    audio.onerror = () => {
      resolve(0); // Si no se puede leer, retorna 0
    };

    audio.src = URL.createObjectURL(file);
  });
};

export default useAudioUpload; 