import { Event, Article, Artist, Venue, MediaItem } from './types';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'DANCE CONTROL',
    subtitle: 'La Experiencia Techno Definitiva',
    date: '2025-07-15',
    time: '23:00',
    venue: 'Pacha Ibiza',
    city: 'Ibiza',
    country: 'España',
    description: 'Una noche épica que redefine los límites de la música electrónica con los mejores DJs del underground techno.',
    image: '/images/hero-techno-festival.jpg',
    artists: [
      {
        id: '1',
        name: 'Karretero',
        bio: 'Producer y DJ underground especializado en techno industrial',
        image: '/images/dj-setup-techno.jpg',
        genres: ['Techno', 'Industrial'],
        country: 'España',
        social: {
          soundcloud: 'karretero-official',
          instagram: '@karretero_official'
        },
        featured: true,
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }
    ],
    genres: ['Techno', 'Electronic', 'Underground'],
    tickets: {
      price: 35,
      currency: 'EUR',
      url: 'https://tickets.example.com',
      available: true
    },
    featured: true,
    category: 'club',
    tags: ['ibiza', 'techno', 'underground', 'dance'],
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: '2',
    title: 'VETA Festival 2025',
    subtitle: 'Mine Sound Extraction desde lo más profundo de la cantera',
    date: '2025-08-20',
    time: '16:00',
    venue: 'Cantera Industrial',
    city: 'Valencia',
    country: 'España',
    description: 'Festival único en una cantera abandonada que explora los sonidos más profundos del techno minimalista.',
    image: '/images/electronic-stage.jpg',
    artists: [],
    genres: ['Minimal Techno', 'Deep House', 'Electronic'],
    tickets: {
      price: 65,
      currency: 'EUR',
      url: 'https://vetafestival.com',
      available: true
    },
    featured: true,
    category: 'festival',
    tags: ['valencia', 'minimal', 'festival', 'cantera'],
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: '3',
    title: 'Paradise Ibiza',
    subtitle: 'Summer Residency 2025',
    date: '2025-06-30',
    time: '22:00',
    venue: 'Eden Ibiza',
    city: 'Ibiza',
    country: 'España',
    description: 'La residencia de verano más esperada con los mejores exponentes del tech house mundial.',
    image: '/images/ibiza-techno-club.webp',
    artists: [],
    genres: ['Tech House', 'Deep House', 'Electronic'],
    tickets: {
      price: 45,
      currency: 'EUR',
      url: 'https://paradise-ibiza.com',
      available: true
    },
    featured: false,
    category: 'club',
    tags: ['ibiza', 'tech house', 'residency', 'summer'],
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  }
];

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Karretero lanza su nuevo EP "Work It" en Bandidos',
    subtitle: 'Una exploración profunda del techno industrial español',
    content: `El productor español Karretero continúa consolidándose como una de las figuras más prometedoras del techno underground ibérico con el lanzamiento de su nuevo EP "Work It" a través del sello Bandidos Records.

Este trabajo de cuatro tracks explora los territorios más oscuros del techno industrial, fusionando elementos del EBM clásico con texturas contemporáneas que definen el sonido de la nueva generación techno española.

El EP abre con el track titular "Work It", una pieza hipnótica que construye tensión a través de secuencias ácidas y percusiones contundentes. La producción demuestra la madurez artística de Karretero, quien ha logrado desarrollar un sonido distintivo que honra las raíces del techno europeo mientras aporta una perspectiva fresca y contemporánea.

"Industrial Dreams", el segundo corte, profundiza en territorios más experimentales con ambientaciones atmosféricas que evocan paisajes post-industriales. La track funciona como un puente entre la brutalidad del opening y los momentos más introspectivos del EP.

Bandidos Records, conocido por su roster de artistas underground de la península ibérica, considera este lanzamiento como uno de los más importantes de su catálogo 2025.`,
    excerpt: 'Karretero presenta su nuevo EP "Work It" explorando los límites del techno industrial español.',
    author: 'Ana Martínez',
    image: '/images/vinyl-turntable.jpg',
    category: 'news',
    tags: ['karretero', 'ep', 'bandidos records', 'techno industrial'],
    published: true,
    featured: true,
    seo: {
      meta_title: 'Karretero - Nuevo EP Work It | Techno Experience',
      meta_description: 'Descubre el nuevo EP de Karretero "Work It" lanzado en Bandidos Records. Techno industrial español de vanguardia.',
      keywords: ['karretero', 'work it', 'bandidos records', 'techno', 'ep 2025']
    },
    created_at: '2025-01-15',
    updated_at: '2025-01-15',
    published_at: '2025-01-15'
  },
  {
    id: '2',
    title: 'Descubre la programación de Junio de Pacha Ibiza',
    subtitle: 'Los mejores eventos del templo techno mediterráneo',
    content: `Pacha Ibiza presenta su programación de junio 2025, consolidando una vez más su posición como epicentro de la música electrónica mundial. La icónica sala ibicenca ha preparado una selección de eventos que prometen redefinir la experiencia clubbing en la isla blanca.

El mes arranca con fuerza el 1 de junio con la apertura oficial de la temporada, presentando un line-up que incluye tanto leyendas consolidadas como los talentos emergentes más prometedores de la escena internacional.

La programación destaca por su diversidad estilística, abarcando desde el techno más puro hasta las vertientes más experimentales del house y la música electrónica contemporánea. Cada noche ha sido cuidadosamente curada para ofrecer una experiencia única que respete la tradición de Pacha mientras abraza la innovación.

Entre los momentos destacados del mes se encuentran las noches temáticas dedicadas al underground español, donde productores locales compartirán cabina con figuras internacionales, creando un diálogo musical que celebra tanto las raíces como la evolución del sonido electrónico.

La icónica arquitectura de Pacha, con su distintivo diseño de cúpulas blancas y su sistema de sonido de última generación, proporcionará el marco perfecto para estas experiencias sensoriales inmersivas.`,
    excerpt: 'Pacha Ibiza revela su programación de junio con los mejores eventos de música electrónica.',
    author: 'Carlos Rodríguez',
    image: '/images/techno-party-neon.jpg',
    category: 'news',
    tags: ['pacha ibiza', 'programación', 'junio 2025', 'clubbing'],
    published: true,
    featured: true,
    seo: {
      meta_title: 'Programación Junio Pacha Ibiza 2025 | Techno Experience',
      meta_description: 'Descubre todos los eventos de Pacha Ibiza en junio 2025. La mejor música electrónica en el templo del clubbing mediterráneo.',
      keywords: ['pacha ibiza', 'programación junio', 'clubbing', 'música electrónica', 'ibiza 2025']
    },
    created_at: '2025-01-10',
    updated_at: '2025-01-10',
    published_at: '2025-01-10'
  },
  {
    id: '3',
    title: 'Descubre la esencia de Mosha',
    subtitle: 'El productor que está revolucionando el minimal techno',
    content: `En el panorama actual del minimal techno, pocas figuras logran capturar la atención de manera tan orgánica como Mosha. Este productor, cuya identidad permanece deliberadamente en las sombras, ha construido una reputación sólida basada exclusivamente en la calidad de sus producciones y la profundidad de su propuesta artística.

Mosha emerge desde las profundidades del underground electrónico con un enfoque purista que privilegia la sustancia sobre la forma. Sus composiciones se caracterizan por estructuras hipnóticas que evolucionan de manera orgánica, creando paisajes sonoros que transportan al oyente a estados de conciencia alterados.

La estética de Mosha se fundamenta en la repetición como herramienta de trascendencia. Cada elemento en sus tracks tiene un propósito específico, desde los hi-hats más sutiles hasta los bajos más profundos, todo contribuye a la construcción de una experiencia total que trasciende la simple música de baile.

Su último lanzamiento, "Inner Depths", ejemplifica perfectamente esta filosofía. A lo largo de sus ocho minutos de duración, la track desarrolla una narrativa emocional compleja utilizando únicamente elementos mínimos: un patrón rítmico hipnótico, texturas ambientales etéreas y un bajo que funciona como columna vertebral de toda la composición.

La influencia de Mosha en la nueva generación de productores minimal es innegable. Su enfoque despojado y su respeto por el espacio y el silencio han inspirado a numerosos artistas a explorar territorios menos transitados del techno contemporáneo.`,
    excerpt: 'Conoce a Mosha, el productor anónimo que está redefiniendo los límites del minimal techno.',
    author: 'Laura Fernández',
    image: '/images/electronic-stage.jpg',
    category: 'feature',
    tags: ['mosha', 'minimal techno', 'underground', 'productor'],
    published: true,
    featured: false,
    seo: {
      meta_title: 'Mosha: El Genio Anónimo del Minimal Techno | Techno Experience',
      meta_description: 'Descubre la esencia de Mosha, el productor que revoluciona el minimal techno con su enfoque purista y profundo.',
      keywords: ['mosha', 'minimal techno', 'productor underground', 'inner depths', 'electronic music']
    },
    created_at: '2025-01-05',
    updated_at: '2025-01-05',
    published_at: '2025-01-05'
  }
];

export const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Pacha Ibiza',
    description: 'El templo del clubbing mediterráneo, icono de la música electrónica mundial desde 1973.',
    address: 'Av. 8 de Agosto, s/n, 07800 Ibiza',
    city: 'Ibiza',
    country: 'España',
    coordinates: {
      lat: 38.9067,
      lng: 1.4205
    },
    capacity: 3000,
    website: 'https://pacha.com',
    social: {
      instagram: '@pacha',
      facebook: 'PachaOfficial',
      twitter: '@pacha'
    },
    image: '/images/ibiza-techno-club.webp',
    featured: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: '2',
    name: 'Eden Ibiza',
    description: 'Club emblemático de San Antonio con una de las mejores producciones audiovisuales de Europa.',
    address: 'Carrer de Salvador Espriu, s/n, 07820 Sant Antoni de Portmany',
    city: 'Ibiza',
    country: 'España',
    coordinates: {
      lat: 38.9833,
      lng: 1.3000
    },
    capacity: 1500,
    website: 'https://edenibiza.com',
    social: {
      instagram: '@edenibiza',
      facebook: 'EdenIbiza'
    },
    image: '/images/electronic-stage.jpg',
    featured: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  }
];

export const mockMediaItems: MediaItem[] = [
  {
    id: '1',
    title: 'DANCE CONTROL Flyer Design',
    description: 'Diseño oficial del evento más esperado del verano techno',
    type: 'flyer',
    url: '/images/hero-techno-festival.jpg',
    artist: 'Karretero',
    event: 'DANCE CONTROL',
    year: 2025,
    genre: 'Techno',
    location: 'Ibiza',
    tags: ['flyer', 'design', 'techno', 'ibiza'],
    featured: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  },
  {
    id: '2',
    title: 'Underground Session #047',
    description: 'Set exclusivo grabado en las profundidades del techno underground',
    type: 'audio',
    url: '/audio/underground-session-047.mp3',
    artist: 'Mosha',
    year: 2025,
    genre: 'Minimal Techno',
    tags: ['set', 'underground', 'minimal', 'techno'],
    featured: false,
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  }
];

export const navigationItems = [
  { id: 'home', label: 'HOME', path: '/', color: '#FFFFFF' },
  { id: 'events', label: 'EVENTOS', path: '/eventos', color: '#00CED1' },
  { id: 'articles', label: 'ARTÍCULOS', path: '/articulos', color: '#8A2BE2' },
  { id: 'archive', label: 'ARCHIVO', path: '/archivo', color: '#0066FF' },
  { id: 'artists', label: 'ARTISTAS', path: '/artistas', color: '#00FF00' },
  { id: 'music', label: 'MÚSICA', path: '/musica', color: '#FF1493' },
  { id: 'about', label: 'NOSOTROS', path: '/nosotros', color: '#F2FF00' },
  { id: 'contact', label: 'CONTACTO', path: '/contacto', color: '#FF8C00' }
];
