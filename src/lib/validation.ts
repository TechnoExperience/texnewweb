import { z } from 'zod'

/**
 * Validation Schemas for all content types
 * Uses Zod for runtime type checking and validation
 */

// Common schemas
const slugSchema = z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

const emailSchema = z.string()
    .email('Invalid email address')

const urlSchema = z.string()
    .url('Invalid URL')
    .or(z.literal(''))

const uuidSchema = z.string()
    .uuid('Invalid UUID')

// News Article Schema
export const newsArticleSchema = z.object({
    id: uuidSchema.optional(),
    title: z.string()
        .min(10, 'Title must be at least 10 characters')
        .max(200, 'Title must be less than 200 characters'),
    slug: slugSchema,
    excerpt: z.string()
        .min(50, 'Excerpt must be at least 50 characters')
        .max(500, 'Excerpt must be less than 500 characters'),
    content: z.string()
        .min(100, 'Content must be at least 100 characters'),
    author: z.string()
        .min(2, 'Author name must be at least 2 characters')
        .max(100, 'Author name must be less than 100 characters'),
    published_date: z.string()
        .datetime('Invalid date format'),
    image_url: urlSchema.optional(),
    category: z.enum([
        'Entrevistas',
        'Críticas',
        'Crónicas',
        'Tendencias',
        'Editoriales',
        'Festivales',
        'Clubs',
        'Lanzamientos',
        'Industria',
        'Otros'
    ]),
    article_type: z.enum([
        'entrevista',
        'critica',
        'cronica',
        'reportaje',
        'editorial',
        'galeria',
        'video',
        'podcast'
    ]).optional(),
    reading_time: z.number().min(1).max(60).optional(),
    tags: z.array(z.string()).optional(),
    related_artists: z.array(z.string()).optional(),
    related_events: z.array(z.string()).optional(),
    related_releases: z.array(z.string()).optional(),
    language: z.enum(['es', 'en', 'de', 'fr']).default('es'),
    featured: z.boolean().default(false),
})

export type NewsArticleInput = z.infer<typeof newsArticleSchema>

// Event Schema
export const eventSchema = z.object({
    id: uuidSchema.optional(),
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be less than 200 characters'),
    slug: slugSchema,
    description: z.string()
        .min(20, 'Description must be at least 20 characters'),
    event_date: z.string()
        .datetime('Invalid date format'),
    venue: z.string()
        .min(2, 'Venue must be at least 2 characters')
        .max(200, 'Venue must be less than 200 characters'),
    city: z.string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City must be less than 100 characters'),
    country: z.string()
        .min(2, 'Country must be at least 2 characters')
        .max(100, 'Country must be less than 100 characters'),
    lineup: z.array(z.string())
        .min(1, 'At least one artist required')
        .max(50, 'Maximum 50 artists allowed'),
    image_url: urlSchema.optional(),
    ticket_url: urlSchema.optional(),
    language: z.enum(['es', 'en', 'de', 'fr']).default('es'),
    featured: z.boolean().default(false),
    event_type: z.enum(['dj', 'promoter_festival', 'record_label', 'club']).optional(),
    view_count: z.number().int().min(0).default(0).optional(),
    set_times: z.record(z.string()).optional(),
})

export type EventInput = z.infer<typeof eventSchema>

// Release Schema
export const releaseSchema = z.object({
    id: uuidSchema.optional(),
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    artist: z.string()
        .min(1, 'Artist is required')
        .max(200, 'Artist name must be less than 200 characters'),
    label: z.string()
        .min(1, 'Label is required')
        .max(200, 'Label must be less than 200 characters'),
    release_date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Release date must be in YYYY-MM-DD format'),
    cover_art: urlSchema.optional(),
    genre: z.array(z.string())
        .min(1, 'At least one genre required')
        .max(10, 'Maximum 10 genres allowed'),
    techno_style: z.string()
        .min(1, 'Techno style is required'),
    language: z.enum(['es', 'en', 'de', 'fr']).default('es'),
    featured: z.boolean().default(false),
    release_type: z.enum(['single', 'ep', 'album', 'remix', 'compilation']).optional(),
    tracklist: z.array(z.string()).optional(),
    links: z.object({
        spotify: urlSchema.optional(),
        beatport: urlSchema.optional(),
        soundcloud: urlSchema.optional(),
    }).optional(),
})

export type ReleaseInput = z.infer<typeof releaseSchema>

// Video Schema
export const videoSchema = z.object({
    id: uuidSchema.optional(),
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be less than 200 characters'),
    description: z.string()
        .min(20, 'Description must be at least 20 characters'),
    youtube_url: z.string()
        .url('Invalid YouTube URL')
        .regex(/^https:\/\/(www\.)?youtube\.com\/watch\?v=/, 'Must be a valid YouTube watch URL'),
    thumbnail_url: urlSchema.optional(),
    artist: z.string()
        .min(1, 'Artist is required')
        .max(200, 'Artist name must be less than 200 characters'),
    event_name: z.string().optional(),
    video_date: z.string()
        .datetime('Invalid date format'),
    duration: z.number()
        .int('Duration must be an integer')
        .min(0, 'Duration must be positive'),
    category: z.enum(['dj_set', 'short_video', 'aftermovie', 'live_set']),
    language: z.enum(['es', 'en', 'de', 'fr']).default('es'),
    featured: z.boolean().default(false),
    view_count: z.number().int().min(0).default(0),
    video_type: z.enum(['aftermovie', 'live_set', 'music_video', 'dj_mix']).optional(),
})

export type VideoInput = z.infer<typeof videoSchema>

// User Profile Schema
export const profileSchema = z.object({
    id: uuidSchema.optional(),
    email: emailSchema,
    role: z.enum(['super_admin', 'admin', 'editor', 'user']).default('user'),
    profile_type: z.enum(['dj', 'promoter', 'clubber', 'label', 'agency']).optional(),
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    bio: z.string()
        .max(1000, 'Bio must be less than 1000 characters')
        .optional(),
    avatar_url: urlSchema.optional(),
    city: z.string()
        .max(100, 'City must be less than 100 characters')
        .optional(),
    country: z.string()
        .max(100, 'Country must be less than 100 characters')
        .optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>

// Auth Schemas
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string()
        .min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
    email: emailSchema,
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Validation helper function
 */
export function validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
    const result = schema.safeParse(data)

    if (result.success) {
        return { success: true, data: result.data }
    }

    return { success: false, errors: result.error }
}

/**
 * Get validation errors as a flat object
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {}

    error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
    })

    return errors
}
