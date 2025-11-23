Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Configuración de Supabase no disponible');
        }

        // Configuración de la consulta GraphQL de Resident Advisor
        const raGraphQLEndpoint = 'https://ra.co/graphql';
        
        const areas = ['London', 'Berlin', 'Madrid', 'Barcelona', 'Amsterdam', 'Paris'];
        let totalEventosNuevos = 0;
        let totalEventosActualizados = 0;

        for (const area of areas) {
            try {
                // Calcular fechas (próximos 30 días)
                const fechaInicio = new Date().toISOString().split('T')[0];
                const fechaFin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const query = `
                    query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) {
                        popularEvents(filters: $filters, pageSize: $pageSize) {
                            id
                            title
                            attending
                            date
                            contentUrl
                            flyerFront
                            images {
                                id
                                filename
                                alt
                            }
                            venue {
                                id
                                name
                                contentUrl
                                live
                            }
                        }
                    }
                `;

                const variables = {
                    filters: {
                        area: area,
                        listingDate: fechaInicio
                    },
                    pageSize: 50
                };

                // Llamada a la API GraphQL de RA
                const raResponse = await fetch(raGraphQLEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    body: JSON.stringify({ query, variables })
                });

                if (!raResponse.ok) {
                    console.error(`Error RA API para ${area}:`, await raResponse.text());
                    continue;
                }

                const raData = await raResponse.json();
                
                if (!raData.data || !raData.data.popularEvents) {
                    console.log(`Sin eventos para ${area}`);
                    continue;
                }

                const eventos = raData.data.popularEvents;

                // Procesar cada evento
                for (const evento of eventos) {
                    const eventoData = {
                        nombre: evento.title || 'Sin título',
                        slug: `${evento.id}-${evento.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'evento'}`,
                        fecha_inicio: new Date(evento.date).toISOString(),
                        fecha_fin: new Date(new Date(evento.date).getTime() + 6 * 60 * 60 * 1000).toISOString(),
                        venue_nombre: evento.venue?.name || 'Venue desconocido',
                        ciudad: area,
                        estado: 'publicado',
                        flyer_url: evento.flyerFront || (evento.images?.[0]?.filename || ''),
                        ra_event_id: evento.id,
                        ra_synced: true,
                        artistas: ['Por confirmar'],
                        tipo_evento: 'club_night'
                    };

                    // Verificar si el evento ya existe
                    const checkResponse = await fetch(
                        `${supabaseUrl}/rest/v1/eventos?ra_event_id=eq.${evento.id}`,
                        {
                            headers: {
                                'apikey': serviceRoleKey,
                                'Authorization': `Bearer ${serviceRoleKey}`
                            }
                        }
                    );

                    const existingEvents = await checkResponse.json();

                    if (existingEvents && existingEvents.length > 0) {
                        // Actualizar evento existente
                        const updateResponse = await fetch(
                            `${supabaseUrl}/rest/v1/eventos?ra_event_id=eq.${evento.id}`,
                            {
                                method: 'PATCH',
                                headers: {
                                    'apikey': serviceRoleKey,
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=minimal'
                                },
                                body: JSON.stringify({
                                    ...eventoData,
                                    updated_at: new Date().toISOString()
                                })
                            }
                        );

                        if (updateResponse.ok) {
                            totalEventosActualizados++;
                        }
                    } else {
                        // Insertar nuevo evento
                        const insertResponse = await fetch(
                            `${supabaseUrl}/rest/v1/eventos`,
                            {
                                method: 'POST',
                                headers: {
                                    'apikey': serviceRoleKey,
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=minimal'
                                },
                                body: JSON.stringify(eventoData)
                            }
                        );

                        if (insertResponse.ok) {
                            totalEventosNuevos++;
                        }
                    }
                }

            } catch (areaError) {
                console.error(`Error procesando ${area}:`, areaError);
            }
        }

        const resultado = {
            success: true,
            timestamp: new Date().toISOString(),
            areas_procesadas: areas.length,
            eventos_nuevos: totalEventosNuevos,
            eventos_actualizados: totalEventosActualizados,
            total_procesados: totalEventosNuevos + totalEventosActualizados
        };

        return new Response(JSON.stringify(resultado), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error en sincronización RA:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'SYNC_RA_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
