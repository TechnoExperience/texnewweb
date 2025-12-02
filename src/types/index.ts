// Database types
export type ArticleCategory = 
    | "Entrevistas"
    | "Críticas"
    | "Crónicas"
    | "Tendencias"
    | "Editoriales"
    | "Festivales"
    | "Clubs"
    | "Lanzamientos"
    | "Industria"
    | "Otros"

export type ArticleType = 
    | "entrevista"
    | "critica"
    | "cronica"
    | "reportaje"
    | "editorial"
    | "galeria"
    | "video"
    | "podcast"

export interface NewsArticle {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    author: string
    published_date: string
    image_url: string
    category: ArticleCategory
    language: string
    featured: boolean
    article_type?: ArticleType
    reading_time?: number // minutos de lectura estimados
    tags?: string[]
    // Campos SEO adicionales
    meta_title?: string
    meta_description?: string
    meta_keywords?: string
    og_title?: string
    og_description?: string
    og_image?: string
    seo_focus_keyword?: string
    seo_slug?: string
    related_artists?: string[]
    related_events?: string[]
    related_releases?: string[]
}

export interface Event {
    id: string
    title: string
    slug: string
    description: string
    event_date: string
    venue: string
    city: string
    country: string
    lineup: string[]
    image_url: string
    ticket_url: string
    language: string
    featured: boolean
    header_featured?: boolean
    event_type?: "dj" | "promoter_festival" | "record_label" | "club"
    view_count?: number
    status?: string
    cover_image?: string
    related_club_id?: string
    related_promoter_id?: string
    // Campos extendidos de la migración 00024
    end_datetime?: string
    venue_id?: string
    promoter_id?: string
    cover_image_url?: string
    ticket_link_url?: string
    price_info?: string
}

export interface Release {
    id: string
    title: string
    artist: string
    label: string
    release_date: string
    cover_art: string
    genre: string[]
    techno_style: string
    language: string
    featured: boolean
    release_type?: "single" | "ep" | "album" | "remix" | "compilation"
    tracklist?: string[]
    links?: {
        spotify?: string
        beatport?: string
        soundcloud?: string
    }
  // Player unificado
  player_url?: string
  player_provider?: string
  embed_html?: string // HTML directo del iframe/embed
  player_type?: "tracklist" | "embed" | "auto" // Tipo de reproductor: tracklist, embed, o auto (detecta según datos disponibles)
  status?: "DRAFT" | "PUBLISHED"
}

export interface Video {
    id: string
    title: string
    description: string
    youtube_url: string
    thumbnail_url: string
    artist: string
    event_name?: string
    video_date: string
    duration: number
    category: string
    language: string
    featured: boolean
    view_count: number
    video_type?: "aftermovie" | "live_set" | "music_video" | "dj_mix"
    status?: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED"
    published_date?: string
}

export interface Review {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    author: string
    published_date: string
    image_url?: string
    category: "event" | "dj" | "club" | "promoter" | "general"
    rating?: number
    review_type?: "event" | "dj" | "club" | "promoter" | "general"
    related_event_id?: string
    related_dj_id?: string
    related_club_id?: string
    related_promoter_id?: string
    venue_name?: string
    language: string
    featured: boolean
    tags?: string[]
    view_count: number
}

export interface UserProfile {
    id: string
    email: string
    username?: string
    role: "admin" | "editor" | "user"
    profile_type: "dj" | "promoter" | "clubber" | "label" | "agency" | "club"
    name?: string
    bio?: string
    avatar_url?: string
    city?: string
    country?: string
    // nuevos flags de control desde profiles
    is_active?: boolean
    is_verified?: boolean
    verification_status?: "PENDING" | "APPROVED" | "REJECTED"
    verification_notes?: string
}

export interface Ad {
    id: string
    title: string
    description?: string
    image_url: string
    link_url?: string
    position: "sidebar_top" | "sidebar_middle" | "sidebar_bottom" | "content_top" | "content_bottom"
    ad_type: "banner" | "square" | "rectangle" | "skyscraper"
    width: number
    height: number
    active: boolean
    start_date?: string
    end_date?: string
    click_count: number
    view_count: number
    priority: number
    target_audience?: string[]
    language: string
    created_at: string
    updated_at: string
}

// Ecommerce Types
export interface Category {
    id: string
    name: string
    slug: string
    description?: string
    image_url?: string
    parent_id?: string
    display_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface ProductVariant {
    id: string
    product_id: string
    name: string
    sku?: string
    price?: number
    compare_at_price?: number
    stock_quantity: number
    attributes: Record<string, string>
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Product {
    id: string
    name: string
    slug: string
    description?: string
    short_description?: string
    price: number
    compare_at_price?: number
    sku?: string
    category_id?: string
    images: string[]
    main_image?: string
    stock_quantity: number
    track_inventory: boolean
    is_active: boolean
    is_featured: boolean
    weight_kg?: number
    tags: string[]
    metadata: Record<string, any>
    view_count: number
    created_at: string
    updated_at: string
    // Relations (optional, loaded separately)
    category?: Category
    variants?: ProductVariant[]
}

export interface ProductLike {
    id: string
    user_id: string
    product_id: string
    created_at: string
}

export interface OrderItem {
    id: string
    order_id: string
    product_id?: string
    variant_id?: string
    name: string
    sku?: string
    quantity: number
    unit_price: number
    total_price: number
    attributes: Record<string, string>
    created_at: string
    // Relations (optional, loaded separately)
    product?: Product
    variant?: ProductVariant
}

export type OrderStatus = 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
    id: string
    order_number: string
    user_id?: string
    email: string
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method?: string
    payment_gateway?: string
    payment_reference?: string
    subtotal: number
    tax_amount: number
    shipping_amount: number
    discount_amount: number
    total: number
    currency: string
    shipping_address?: Address
    billing_address?: Address
    notes?: string
    metadata: Record<string, any>
    created_at: string
    updated_at: string
    // Relations (optional, loaded separately)
    items?: OrderItem[]
}

export interface Address {
    first_name: string
    last_name: string
    company?: string
    address_line_1: string
    address_line_2?: string
    city: string
    state?: string
    postal_code: string
    country: string
    phone?: string
}

export interface CartItem {
    product_id: string
    variant_id?: string
    quantity: number
    attributes?: Record<string, string>
    price?: number // Precio al momento de añadir al carrito (snapshot)
    name?: string // Nombre del producto para mostrar
    image?: string // Imagen del producto
}

export interface Cart {
    items: CartItem[]
    subtotal: number
    tax: number
    shipping: number
    discount: number
    total: number
}
