import { supabase } from '../lib/supabase';

export interface StorageSetupResult {
  success: boolean;
  message: string;
  details?: any;
}

export class StorageSetup {
  
  async setupStorage(): Promise<StorageSetupResult[]> {
    console.log('🚀 Configurando Supabase Storage...');
    
    const results: StorageSetupResult[] = [];
    
    try {
      // Crear bucket principal de imágenes
      results.push(await this.createImagesBucket());
      
      // Crear políticas de acceso
      results.push(await this.setupStoragePolicies());
      
      console.log('✅ Configuración de storage completada');
      return results;
      
    } catch (error) {
      console.error('❌ Error durante la configuración de storage:', error);
      return [{
        success: false,
        message: `Error general en la configuración: ${error}`,
        details: error
      }];
    }
  }

  async createImagesBucket(): Promise<StorageSetupResult> {
    try {
      console.log('📁 Creando bucket de imágenes...');
      
      // Verificar si el bucket ya existe
      const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        return {
          success: false,
          message: `Error obteniendo buckets: ${listError.message}`,
          details: listError
        };
      }

      const bucketExists = existingBuckets?.some(bucket => bucket.name === 'images');
      
      if (bucketExists) {
        return {
          success: true,
          message: '✅ Bucket "images" ya existe',
          details: { bucket: 'images', status: 'exists' }
        };
      }

      // Crear nuevo bucket
      const { data, error } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png', 
          'image/webp',
          'image/gif',
          'image/svg+xml'
        ],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });

      if (error) {
        return {
          success: false,
          message: `Error creando bucket: ${error.message}`,
          details: error
        };
      }

      return {
        success: true,
        message: '✅ Bucket "images" creado exitosamente',
        details: data
      };

    } catch (error) {
      return {
        success: false,
        message: `Error inesperado creando bucket: ${error}`,
        details: error
      };
    }
  }

  async setupStoragePolicies(): Promise<StorageSetupResult> {
    try {
      console.log('🔐 Configurando políticas de storage...');
      
      // Nota: Las políticas RLS para storage se deben configurar desde el dashboard de Supabase
      // o usando SQL directo. Aquí documentamos las políticas necesarias.
      
      const policies = [
        {
          name: "Public read access for images",
          sql: `
            CREATE POLICY "Public read access for images" ON storage.objects
            FOR SELECT USING (bucket_id = 'images');
          `
        },
        {
          name: "Authenticated users can upload images",
          sql: `
            CREATE POLICY "Authenticated users can upload images" ON storage.objects
            FOR INSERT WITH CHECK (
              bucket_id = 'images' 
              AND auth.role() = 'authenticated'
            );
          `
        },
        {
          name: "Users can update their own images",
          sql: `
            CREATE POLICY "Users can update their own images" ON storage.objects
            FOR UPDATE USING (
              bucket_id = 'images' 
              AND auth.role() = 'authenticated'
            );
          `
        },
        {
          name: "Users can delete their own images",
          sql: `
            CREATE POLICY "Users can delete their own images" ON storage.objects
            FOR DELETE USING (
              bucket_id = 'images' 
              AND auth.role() = 'authenticated'
            );
          `
        }
      ];

      return {
        success: true,
        message: '✅ Políticas de storage documentadas (configurar manualmente en Supabase Dashboard)',
        details: {
          message: 'Las políticas RLS para storage se deben configurar desde el Supabase Dashboard',
          policies: policies.map(p => ({ name: p.name, sql: p.sql }))
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Error configurando políticas: ${error}`,
        details: error
      };
    }
  }

  async testStorageAccess(): Promise<StorageSetupResult> {
    try {
      console.log('🧪 Probando acceso a storage...');
      
      // Crear un archivo de prueba
      const testFile = new Blob(['test content'], { type: 'text/plain' });
      const testFileName = `test-${Date.now()}.txt`;
      
      // Intentar subir
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`test/${testFileName}`, testFile);

      if (uploadError) {
        return {
          success: false,
          message: `Error en prueba de subida: ${uploadError.message}`,
          details: uploadError
        };
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(`test/${testFileName}`);

      // Limpiar archivo de prueba
      await supabase.storage
        .from('images')
        .remove([`test/${testFileName}`]);

      return {
        success: true,
        message: '✅ Storage funcionando correctamente',
        details: {
          uploadTest: 'success',
          publicUrl: publicUrl,
          cleanup: 'completed'
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Error en prueba de storage: ${error}`,
        details: error
      };
    }
  }

  async getStorageInfo(): Promise<{
    buckets: any[];
    usage: any;
    policies: string;
  }> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      
      return {
        buckets: buckets || [],
        usage: {
          message: 'Información de uso disponible en Supabase Dashboard'
        },
        policies: 'Las políticas RLS se gestionan desde el Dashboard de Supabase'
      };
    } catch (error) {
      console.error('Error obteniendo información de storage:', error);
      return {
        buckets: [],
        usage: {},
        policies: 'Error obteniendo información'
      };
    }
  }
}

// Función helper para ejecutar la configuración
export const runStorageSetup = async (): Promise<void> => {
  const setup = new StorageSetup();
  
  const results = await setup.setupStorage();
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error(`❌ ${result.message}`);
    }
  });

  // Ejecutar prueba
  const testResult = await setup.testStorageAccess();
  if (testResult.success) {
    console.log(`✅ ${testResult.message}`);
  } else {
    console.error(`❌ ${testResult.message}`);
  }
};

export default StorageSetup; 