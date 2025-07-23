import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  progress?: number;
}

interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // en MB
  allowedTypes?: string[];
  resize?: {
    width: number;
    height: number;
    quality?: number;
  };
}

const useStorageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    const {
      bucket = 'images',
      folder = 'uploads',
      maxSize = 5, // 5MB por defecto
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
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

      // Generar nombre único
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      // Procesar imagen si es necesario
      let processedFile = file;
      if (options.resize && file.type.startsWith('image/')) {
        processedFile = await resizeImage(file, options.resize);
      }

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

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
        url: publicUrl
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

  const uploadMultipleFiles = async (
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i], options);
      results.push(result);
      
      // Actualizar progreso general
      setProgress(((i + 1) / files.length) * 100);
    }

    return results;
  };

  const deleteFile = async (url: string, bucket: string = 'images'): Promise<boolean> => {
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

  const getFileInfo = async (url: string, bucket: string = 'images') => {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === bucket);
      if (bucketIndex === -1) return null;
      
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          search: filePath.split('/').pop()
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  };

  const createBucket = async (bucketName: string, isPublic: boolean = true) => {
    try {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
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

  // Función para redimensionar imágenes
  const resizeImage = (file: File, options: { width: number; height: number; quality?: number }): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = options.width;
        canvas.height = options.height;

        // Calcular dimensiones manteniendo ratio
        const ratio = Math.min(options.width / img.width, options.height / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        // Centrar la imagen
        const x = (canvas.width - newWidth) / 2;
        const y = (canvas.height - newHeight) / 2;

        // Dibujar fondo negro
        ctx!.fillStyle = '#000000';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar imagen redimensionada
        ctx!.drawImage(img, x, y, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob!], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          },
          file.type,
          options.quality || 0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getFileInfo,
    createBucket,
    uploading,
    progress
  };
};

export default useStorageUpload; 