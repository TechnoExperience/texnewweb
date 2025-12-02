/**
 * Custom Error Classes
 * Provides structured error handling across the application
 */

export class AppError extends Error {
    public readonly statusCode: number
    public readonly isOperational: boolean
    public readonly code?: string
    public readonly details?: any

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        code?: string,
        details?: any
    ) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)

        this.statusCode = statusCode
        this.isOperational = isOperational
        this.code = code
        this.details = details

        // Only use captureStackTrace if available (Node.js specific)
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this)
        }
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, true, 'VALIDATION_ERROR', details)
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, true, 'AUTHENTICATION_ERROR')
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403, true, 'AUTHORIZATION_ERROR')
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, true, 'NOT_FOUND')
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, true, 'CONFLICT')
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(message, 429, true, 'RATE_LIMIT_EXCEEDED')
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 500, false, 'DATABASE_ERROR', details)
    }
}

/**
 * Error Logger
 * Logs errors to console and external services
 */
class ErrorLogger {
    private isProduction = import.meta.env.PROD

    log(error: Error | AppError, context?: Record<string, any>) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            ...(error instanceof AppError && {
                statusCode: error.statusCode,
                code: error.code,
                details: error.details,
                isOperational: error.isOperational,
            }),
            context,
            timestamp: new Date().toISOString(),
        }

        // Log to console
        if (this.isProduction) {
            console.error('Error:', errorInfo)
        } else {
            console.error('Error:', error)
            if (context) console.error('Context:', context)
        }

        // Send to external service (Sentry, Axiom, etc.)
        if (this.isProduction && error instanceof AppError && !error.isOperational) {
            this.sendToExternalService(errorInfo)
        }
    }

    private sendToExternalService(_errorInfo: any) {
        // TODO: Integrate with Sentry or similar service
        // Example:
        // Sentry.captureException(errorInfo)
    }
}

export const errorLogger = new ErrorLogger()

/**
 * Global Error Handler
 * Handles errors consistently across the application
 */
export class ErrorHandler {
    /**
     * Handle error and return user-friendly message
     */
    handle(error: unknown, context?: Record<string, any>): {
        message: string
        statusCode: number
        code?: string
        details?: any
    } {
        // Log the error
        if (error instanceof Error) {
            errorLogger.log(error, context)
        }

        // Handle known error types
        if (error instanceof AppError) {
            return {
                message: error.message,
                statusCode: error.statusCode,
                code: error.code,
                details: error.details,
            }
        }

        // Handle Supabase errors
        if (this.isSupabaseError(error)) {
            return this.handleSupabaseError(error)
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                message: 'Network error. Please check your connection.',
                statusCode: 503,
                code: 'NETWORK_ERROR',
            }
        }

        // Handle unknown errors
        return {
            message: 'An unexpected error occurred. Please try again.',
            statusCode: 500,
            code: 'UNKNOWN_ERROR',
        }
    }

    /**
     * Check if error is from Supabase
     */
    private isSupabaseError(error: any): boolean {
        return error && typeof error === 'object' && 'code' in error && 'message' in error
    }

    /**
     * Handle Supabase-specific errors
     */
    private handleSupabaseError(error: any): {
        message: string
        statusCode: number
        code?: string
        details?: any
    } {
        const code = error.code

        // Map Supabase error codes to HTTP status codes
        const statusCodeMap: Record<string, number> = {
            '23505': 409, // Unique violation
            '23503': 400, // Foreign key violation
            '42P01': 500, // Undefined table
            'PGRST116': 404, // Not found
            'PGRST204': 400, // Invalid query
        }

        const messageMap: Record<string, string> = {
            '23505': 'This item already exists',
            '23503': 'Referenced item not found',
            '42P01': 'Database configuration error',
            'PGRST116': 'Item not found',
            'PGRST204': 'Invalid query parameters',
        }

        return {
            message: messageMap[code] || error.message || 'Database error occurred',
            statusCode: statusCodeMap[code] || 500,
            code: code,
            details: error.details,
        }
    }

    /**
     * Convert error to user-friendly message
     */
    getUserMessage(error: unknown): string {
        const handled = this.handle(error)
        return handled.message
    }
}

export const errorHandler = new ErrorHandler()

/**
 * Async error wrapper
 * Wraps async functions to catch errors
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
    fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        try {
            return await fn(...args)
        } catch (error) {
            const handled = errorHandler.handle(error, {
                function: fn.name,
                arguments: args,
            })
            throw new AppError(
                handled.message,
                handled.statusCode,
                true,
                handled.code,
                handled.details
            )
        }
    }
}

/**
 * Error boundary helper for React components
 */
export function getErrorBoundaryMessage(error: Error): string {
    if (error instanceof AppError) {
        return error.message
    }

    if (import.meta.env.DEV) {
        return error.message
    }

    return 'Something went wrong. Please refresh the page.'
}
