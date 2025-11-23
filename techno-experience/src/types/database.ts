export interface Perfil {
  id: string;
  user_id: string;
  tipo_perfil: 'dj' | 'promotor' | 'clubber' | 'sello' | 'agencia';
  nombre_artistico?: string;
  nombre_comercial?: string;
  biografia?: string;
  ciudad?: string;
  pais?: string;
  generos_preferidos?: string[];
  redes_sociales?: Record<string, string>;
  verificado: boolean;
  avatar_url?: string;
  cover_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  resumen?: string;
  contenido: string;
  autor_id: string;
  estado: 'borrador' | 'revision' | 'publicado' | 'archivado';
  categoria?: string;
  etiquetas?: string[];
  imagen_portada?: string;
  galeria_imagenes?: string[];
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  fecha_publicacion?: string;
  created_at: string;
  updated_at: string;
}

export interface Evento {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  venue_nombre: string;
  venue_direccion?: string;
  ciudad: string;
  pais?: string;
  promotor_id?: string;
  artistas?: string[];
  lineup?: Record<string, any>;
  estado: 'borrador' | 'aprobado' | 'publicado' | 'cancelado' | 'archivado';
  flyer_url?: string;
  imagenes?: string[];
  url_entradas?: string;
  precio?: Record<string, any>;
  capacidad?: number;
  edad_minima?: number;
  tipo_evento?: string;
  ra_event_id?: string;
  ra_synced: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lanzamiento {
  id: string;
  titulo: string;
  slug: string;
  artistas?: string[];
  sello_id?: string;
  tipo_lanzamiento: 'single' | 'ep' | 'album' | 'remix' | 'compilacion';
  fecha_lanzamiento: string;
  genero?: string;
  subgenero?: string;
  bpm?: number;
  key_musical?: string;
  tracklist?: Record<string, any>;
  creditos?: Record<string, any>;
  artwork_url?: string;
  enlaces_tiendas?: Record<string, any>;
  enlaces_streaming?: Record<string, any>;
  estado: 'borrador' | 'pendiente_derechos' | 'aprobado' | 'publicado';
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  titulo: string;
  slug: string;
  tipo_video: 'aftermovie' | 'live_set' | 'videoclip' | 'dj_mix' | 'documental';
  evento_id?: string;
  lanzamiento_id?: string;
  duracion_segundos?: number;
  url_video: string;
  thumbnail_url?: string;
  descripcion?: string;
  creditos?: Record<string, any>;
  estado: 'borrador' | 'aprobado' | 'publicado';
  vistas: number;
  created_at: string;
  updated_at: string;
}
