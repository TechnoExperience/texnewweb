// Supabase table names
export const TABLES = {
    NEWS: "news",
    EVENTS: "events",
    DJ_RELEASES: "dj_releases",
    RELEASES: "dj_releases", // Alias for convenience
    VIDEOS: "videos",
    REVIEWS: "reviews",
    PROFILES: "profiles",
    ADS: "ads",
    // Ecommerce
    PRODUCTS: "products",
    CATEGORIES: "categories",
    PRODUCT_VARIANTS: "product_variants",
    PRODUCT_LIKES: "product_likes",
    ORDERS: "orders",
    ORDER_ITEMS: "order_items",
    TECH_SCENE_ENTITIES: "tech_scene_entities",
} as const

export type TableName = (typeof TABLES)[keyof typeof TABLES]
