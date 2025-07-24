import { supabase } from '../lib/supabase';

export const checkDatabaseStatus = async () => {
  try {
    console.log('🔍 Verificando estado de la base de datos...');
    
    // Verificar eventos
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, date, location')
      .order('id');
    
    if (eventsError) {
      console.error('❌ Error cargando eventos:', eventsError);
      return false;
    }
    
    console.log('📅 Eventos en la base de datos:');
    console.table(events);
    
    // Verificar artículos
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, category, published')
      .order('id');
    
    if (articlesError) {
      console.error('❌ Error cargando artículos:', articlesError);
      return false;
    }
    
    console.log('📰 Artículos en la base de datos:');
    console.table(articles);
    
    // Verificar artistas
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('id, name, genre')
      .order('id');
    
    if (artistsError) {
      console.error('❌ Error cargando artistas:', artistsError);
      return false;
    }
    
    console.log('🎵 Artistas en la base de datos:');
    console.table(artists);
    
    // Resumen
    console.log('📊 RESUMEN:');
    console.log(`- Eventos: ${events?.length || 0}`);
    console.log(`- Artículos: ${articles?.length || 0}`);
    console.log(`- Artistas: ${artists?.length || 0}`);
    
    return {
      events: events?.length || 0,
      articles: articles?.length || 0,
      artists: artists?.length || 0,
      eventsData: events,
      articlesData: articles,
      artistsData: artists
    };
    
  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
    return false;
  }
};

export const clearAndRecreateData = async () => {
  try {
    console.log('🗑️ Limpiando datos existentes...');
    
    // Eliminar datos existentes
    await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('articles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('artists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('✅ Datos eliminados');
    
    // Importar funciones de creación de datos
    const { createSampleEvents, createSampleArticles } = await import('./createSampleData');
    
    // Crear nuevos datos
    console.log('📝 Creando nuevos datos...');
    const eventsResult = await createSampleEvents();
    const articlesResult = await createSampleArticles();
    
    if (eventsResult && articlesResult) {
      console.log('✅ Datos recreados exitosamente');
      return true;
    } else {
      console.log('❌ Error recreando algunos datos');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error recreando datos:', error);
    return false;
  }
};

export const getEventById = async (eventId: string) => {
  try {
    console.log(`🔍 Buscando evento con ID: ${eventId}`);
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    if (error) {
      console.error('❌ Error buscando evento:', error);
      return null;
    }
    
    if (data) {
      console.log('✅ Evento encontrado:', data);
      return data;
    } else {
      console.log('❌ Evento no encontrado');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error en getEventById:', error);
    return null;
  }
}; 