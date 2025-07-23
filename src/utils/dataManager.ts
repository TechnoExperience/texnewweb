import { Event, Article, Venue, MediaItem } from '../data/types';
import { mockEvents, mockArticles, mockVenues, mockMediaItems } from '../data/mockData';

// Clave base para localStorage
const STORAGE_KEY_PREFIX = 'techno_experience_';

// Claves específicas para cada tipo de dato
const STORAGE_KEYS = {
  events: `${STORAGE_KEY_PREFIX}events`,
  articles: `${STORAGE_KEY_PREFIX}articles`,
  venues: `${STORAGE_KEY_PREFIX}venues`,
  media: `${STORAGE_KEY_PREFIX}media`,
  settings: `${STORAGE_KEY_PREFIX}settings`
};

export class DataManager {
  // Métodos genéricos para localStorage
  private static setData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private static getData<T>(key: string, defaultData: T[]): T[] {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return defaultData;
  }

  // Inicializar datos si no existen
  static initializeData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.events)) {
      this.setData(STORAGE_KEYS.events, mockEvents);
    }
    if (!localStorage.getItem(STORAGE_KEYS.articles)) {
      this.setData(STORAGE_KEYS.articles, mockArticles);
    }
    if (!localStorage.getItem(STORAGE_KEYS.venues)) {
      this.setData(STORAGE_KEYS.venues, mockVenues);
    }
    if (!localStorage.getItem(STORAGE_KEYS.media)) {
      this.setData(STORAGE_KEYS.media, mockMediaItems);
    }
  }

  // EVENTOS
  static getEvents(): Event[] {
    return this.getData(STORAGE_KEYS.events, mockEvents);
  }

  static saveEvents(events: Event[]): void {
    this.setData(STORAGE_KEYS.events, events);
  }

  static addEvent(event: Event): void {
    const events = this.getEvents();
    events.push(event);
    this.saveEvents(events);
  }

  static updateEvent(eventId: string, updatedEvent: Partial<Event>): void {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      events[index] = { ...events[index], ...updatedEvent, updated_at: new Date().toISOString() };
      this.saveEvents(events);
    }
  }

  static deleteEvent(eventId: string): void {
    const events = this.getEvents();
    const filtered = events.filter(e => e.id !== eventId);
    this.saveEvents(filtered);
  }

  // ARTÍCULOS
  static getArticles(): Article[] {
    return this.getData(STORAGE_KEYS.articles, mockArticles);
  }

  static saveArticles(articles: Article[]): void {
    this.setData(STORAGE_KEYS.articles, articles);
  }

  static addArticle(article: Article): void {
    const articles = this.getArticles();
    articles.push(article);
    this.saveArticles(articles);
  }

  static updateArticle(articleId: string, updatedArticle: Partial<Article>): void {
    const articles = this.getArticles();
    const index = articles.findIndex(a => a.id === articleId);
    if (index !== -1) {
      articles[index] = { ...articles[index], ...updatedArticle, updated_at: new Date().toISOString() };
      this.saveArticles(articles);
    }
  }

  static deleteArticle(articleId: string): void {
    const articles = this.getArticles();
    const filtered = articles.filter(a => a.id !== articleId);
    this.saveArticles(filtered);
  }

  // VENUES
  static getVenues(): Venue[] {
    return this.getData(STORAGE_KEYS.venues, mockVenues);
  }

  static saveVenues(venues: Venue[]): void {
    this.setData(STORAGE_KEYS.venues, venues);
  }

  // MEDIA
  static getMediaItems(): MediaItem[] {
    return this.getData(STORAGE_KEYS.media, mockMediaItems);
  }

  static saveMediaItems(items: MediaItem[]): void {
    this.setData(STORAGE_KEYS.media, items);
  }

  static addMediaItem(item: MediaItem): void {
    const items = this.getMediaItems();
    items.push(item);
    this.saveMediaItems(items);
  }

  // ESTADÍSTICAS
  static getStats() {
    const events = this.getEvents();
    const articles = this.getArticles();
    const media = this.getMediaItems();
    
    return {
      totalEvents: events.length,
      featuredEvents: events.filter(e => e.featured).length,
      totalArticles: articles.length,
      publishedArticles: articles.filter(a => a.published).length,
      totalVenues: this.getVenues().length,
      totalMedia: media.length,
      categories: Array.from(new Set(events.map(e => e.category))),
      cities: Array.from(new Set(events.map(e => e.city))),
      genres: Array.from(new Set(events.flatMap(e => e.genres))),
      tags: Array.from(new Set(articles.flatMap(a => a.tags)))
    };
  }

  // BÚSQUEDA AVANZADA
  static searchEvents(query: string, filters: any = {}): Event[] {
    const events = this.getEvents();
    return events.filter(event => {
      const matchesQuery = !query || 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.venue.toLowerCase().includes(query.toLowerCase()) ||
        event.city.toLowerCase().includes(query.toLowerCase()) ||
        event.artists.some(artist => artist.name.toLowerCase().includes(query.toLowerCase()));

      const matchesCategory = !filters.category || filters.category === 'all' || event.category === filters.category;
      const matchesCity = !filters.city || filters.city === 'all' || event.city === filters.city;
      const matchesGenre = !filters.genre || filters.genre === 'all' || event.genres.includes(filters.genre);

      return matchesQuery && matchesCategory && matchesCity && matchesGenre;
    });
  }

  static searchArticles(query: string, filters: any = {}): Article[] {
    const articles = this.getArticles();
    return articles.filter(article => {
      const matchesQuery = !query ||
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase()) ||
        article.author.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

      const matchesCategory = !filters.category || filters.category === 'all' || article.category === filters.category;
      const matchesTag = !filters.tag || filters.tag === 'all' || article.tags.includes(filters.tag);
      const matchesPublished = filters.published === undefined || article.published === filters.published;

      return matchesQuery && matchesCategory && matchesTag && matchesPublished;
    });
  }

  // EXPORTAR/IMPORTAR DATOS
  static exportData(): string {
    const data = {
      events: this.getEvents(),
      articles: this.getArticles(),
      venues: this.getVenues(),
      media: this.getMediaItems(),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.events) this.saveEvents(data.events);
      if (data.articles) this.saveArticles(data.articles);
      if (data.venues) this.saveVenues(data.venues);
      if (data.media) this.saveMediaItems(data.media);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // LIMPIAR DATOS
  static resetData(): void {
    localStorage.removeItem(STORAGE_KEYS.events);
    localStorage.removeItem(STORAGE_KEYS.articles);
    localStorage.removeItem(STORAGE_KEYS.venues);
    localStorage.removeItem(STORAGE_KEYS.media);
    this.initializeData();
  }
}

// Inicializar datos al cargar
DataManager.initializeData();

export default DataManager;
