Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { fileData, fileName, fileType, folder } = await req.json();

        if (!fileData || !fileName) {
            throw new Error('fileData y fileName son requeridos');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Configuración de Supabase no disponible');
        }

        // Extraer datos base64 del data URL
        const base64Data = fileData.split(',')[1];
        const mimeType = fileData.split(';')[0].split(':')[1];

        // Convertir base64 a binario
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Generar ruta de almacenamiento con timestamp
        const timestamp = Date.now();
        const folderPath = folder || 'general';
        const storagePath = `${folderPath}/${timestamp}-${fileName}`;

        // Subir a Supabase Storage
        const uploadResponse = await fetch(
            `${supabaseUrl}/storage/v1/object/techno-media/${storagePath}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': mimeType,
                    'x-upsert': 'true'
                },
                body: binaryData
            }
        );

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Error en upload: ${errorText}`);
        }

        // Obtener URL pública
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/techno-media/${storagePath}`;

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                path: storagePath,
                size: binaryData.length,
                mimeType
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error en upload:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'UPLOAD_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
