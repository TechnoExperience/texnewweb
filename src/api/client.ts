import { supabase } from '@/lib/supabase'

// API Response types
export interface APIResponse<T = any> {
    data: T | null
    error: APIError | null
    status: number
}

export interface APIError {
    message: string
    code?: string
    details?: any
}

// Request configuration
export interface RequestConfig {
    retry?: number
    timeout?: number
    cache?: boolean
    cacheTTL?: number
}

/**
 * Centralized API Client
 * Handles all HTTP requests with error handling, retries, and caching
 */
class APIClient {
    private baseURL: string
    private defaultTimeout = 30000 // 30 seconds
    private retryAttempts = 3
    private retryDelay = 1000 // 1 second

    constructor(baseURL?: string) {
        this.baseURL = baseURL || import.meta.env.VITE_API_URL || ''
    }

    /**
     * GET request
     */
    async get<T>(
        endpoint: string,
        params?: Record<string, any>,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>('GET', endpoint, undefined, params, config)
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        data?: any,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>('POST', endpoint, data, undefined, config)
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        data?: any,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>('PUT', endpoint, data, undefined, config)
    }

    /**
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        data?: any,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>('PATCH', endpoint, data, undefined, config)
    }

    /**
     * DELETE request
     */
    async delete<T>(
        endpoint: string,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>('DELETE', endpoint, undefined, undefined, config)
    }

    /**
     * Core request method with retry logic
     */
    private async request<T>(
        method: string,
        endpoint: string,
        data?: any,
        params?: Record<string, any>,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        const maxRetries = config?.retry ?? this.retryAttempts
        let lastError: any

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.executeRequest<T>(
                    method,
                    endpoint,
                    data,
                    params,
                    config
                )
                return response
            } catch (error: any) {
                lastError = error

                // Don't retry on client errors (4xx)
                if (error.status && error.status >= 400 && error.status < 500) {
                    break
                }

                // Don't retry on last attempt
                if (attempt === maxRetries) {
                    break
                }

                // Wait before retry with exponential backoff
                await this.delay(this.retryDelay * Math.pow(2, attempt))
            }
        }

        return {
            data: null,
            error: this.formatError(lastError),
            status: lastError?.status || 500
        }
    }

    /**
     * Execute single HTTP request
     */
    private async executeRequest<T>(
        method: string,
        endpoint: string,
        data?: any,
        params?: Record<string, any>,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        // Build URL with query params
        const url = this.buildURL(endpoint, params)

        // Get auth token
        const token = await this.getAuthToken()

        // Build headers
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        // Create abort controller for timeout
        const controller = new AbortController()
        const timeout = setTimeout(
            () => controller.abort(),
            config?.timeout ?? this.defaultTimeout
        )

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : undefined,
                signal: controller.signal,
            })

            clearTimeout(timeout)

            // Parse response
            const responseData = await response.json().catch(() => null)

            if (!response.ok) {
                throw {
                    message: responseData?.message || response.statusText,
                    status: response.status,
                    code: responseData?.code,
                    details: responseData?.details,
                }
            }

            return {
                data: responseData,
                error: null,
                status: response.status,
            }
        } catch (error: any) {
            clearTimeout(timeout)

            if (error.name === 'AbortError') {
                throw {
                    message: 'Request timeout',
                    status: 408,
                    code: 'TIMEOUT',
                }
            }

            throw error
        }
    }

    /**
     * Get authentication token from Supabase
     */
    private async getAuthToken(): Promise<string | null> {
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token || null
    }

    /**
     * Build URL with query parameters
     */
    private buildURL(endpoint: string, params?: Record<string, any>): string {
        const url = new URL(endpoint, this.baseURL || window.location.origin)

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value))
                }
            })
        }

        return url.toString()
    }

    /**
     * Format error for consistent error handling
     */
    private formatError(error: any): APIError {
        return {
            message: error?.message || 'An unexpected error occurred',
            code: error?.code,
            details: error?.details,
        }
    }

    /**
     * Delay helper for retries
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

// Export singleton instance
export const apiClient = new APIClient()
