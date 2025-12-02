/**
 * Centralized Logging System
 * Provides structured logging with multiple levels and external service integration
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal',
}

export interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
    context?: Record<string, any>
    userId?: string
    sessionId?: string
    error?: {
        message: string
        stack?: string
        code?: string
    }
    performance?: {
        duration?: number
        memory?: number
    }
}

export interface LoggerConfig {
    minLevel: LogLevel
    enableConsole: boolean
    enableExternal: boolean
    sessionId?: string
}

class Logger {
    private config: LoggerConfig
    private sessionId: string
    private userId?: string

    constructor(config?: Partial<LoggerConfig>) {
        this.config = {
            minLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
            enableConsole: true,
            enableExternal: import.meta.env.PROD,
            ...config,
        }

        this.sessionId = config?.sessionId || this.generateSessionId()
    }

    /**
     * Set user ID for logs
     */
    setUserId(userId: string) {
        this.userId = userId
    }

    /**
     * Debug level log
     */
    debug(message: string, context?: Record<string, any>) {
        this.log(LogLevel.DEBUG, message, context)
    }

    /**
     * Info level log
     */
    info(message: string, context?: Record<string, any>) {
        this.log(LogLevel.INFO, message, context)
    }

    /**
     * Warning level log
     */
    warn(message: string, context?: Record<string, any>) {
        this.log(LogLevel.WARN, message, context)
    }

    /**
     * Error level log
     */
    error(message: string, error?: Error, context?: Record<string, any>) {
        this.log(LogLevel.ERROR, message, {
            ...context,
            error: error ? {
                message: error.message,
                stack: error.stack,
                code: (error as any).code,
            } : undefined,
        })
    }

    /**
     * Fatal level log
     */
    fatal(message: string, error?: Error, context?: Record<string, any>) {
        this.log(LogLevel.FATAL, message, {
            ...context,
            error: error ? {
                message: error.message,
                stack: error.stack,
                code: (error as any).code,
            } : undefined,
        })
    }

    /**
     * Performance log
     */
    performance(message: string, duration: number, context?: Record<string, any>) {
        this.log(LogLevel.INFO, message, {
            ...context,
            performance: {
                duration,
                memory: (performance as any).memory?.usedJSHeapSize,
            },
        })
    }

    /**
     * Core logging method
     */
    private log(level: LogLevel, message: string, context?: Record<string, any>) {
        if (!this.shouldLog(level)) {
            return
        }

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            userId: this.userId,
            sessionId: this.sessionId,
        }

        if (this.config.enableConsole) {
            this.logToConsole(entry)
        }

        if (this.config.enableExternal) {
            this.logToExternalService(entry)
        }
    }

    /**
     * Check if log level should be logged
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
        const minLevelIndex = levels.indexOf(this.config.minLevel)
        const currentLevelIndex = levels.indexOf(level)

        return currentLevelIndex >= minLevelIndex
    }

    /**
     * Log to console with appropriate styling
     */
    private logToConsole(entry: LogEntry) {
        const style = this.getConsoleStyle(entry.level)
        const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`

        const consoleMethod = this.getConsoleMethod(entry.level)
        consoleMethod(`%c${prefix}%c ${entry.message}`, style, 'color: inherit')

        if (entry.context) {
            console.log(' →', entry.context)
        }

        if (entry.error?.stack) {
            console.error(' Stack:', entry.error.stack)
        }
    }

    /**
     * Get console style based on log level
     */
    private getConsoleStyle(level: LogLevel): string {
        const styles: Record<LogLevel, string> = {
            [LogLevel.DEBUG]: 'color: #888; font-weight: normal',
            [LogLevel.INFO]: 'color: #0066cc; font-weight: bold',
            [LogLevel.WARN]: 'color: #ff9800; font-weight: bold',
            [LogLevel.ERROR]: 'color: #f44336; font-weight: bold',
            [LogLevel.FATAL]: 'color: #d32f2f; font-weight: bold; background: #ffcdd2',
        }

        return styles[level]
    }

    /**
     * Get appropriate console method
     */
    private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
        switch (level) {
            case LogLevel.DEBUG:
            case LogLevel.INFO:
                return console.log
            case LogLevel.WARN:
                return console.warn
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                return console.error
            default:
                return console.log
        }
    }

    /**
     * Log to external service (Axiom, BetterStack, etc.)
     */
    private logToExternalService(entry: LogEntry) {
        // TODO: Integrate with external logging service
        // Example with Axiom:
        /*
        if (window.axiom) {
          window.axiom.ingest('app-logs', [entry])
        }
        */

        // For now, just store in localStorage in dev mode
        if (import.meta.env.DEV) {
            try {
                const logs = JSON.parse(localStorage.getItem('app_logs') || '[]')
                logs.push(entry)
                // Keep only last 100 logs
                if (logs.length > 100) {
                    logs.shift()
                }
                localStorage.setItem('app_logs', JSON.stringify(logs))
            } catch (e) {
                // Ignore localStorage errors
            }
        }
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
}

/**
 * Performance measurement utility
 */
export class PerformanceLogger {
    private logger: Logger
    private marks: Map<string, number>

    constructor(logger: Logger) {
        this.logger = logger
        this.marks = new Map()
    }

    /**
     * Start performance measurement
     */
    start(label: string) {
        this.marks.set(label, performance.now())
    }

    /**
     * End performance measurement and log
     */
    end(label: string, context?: Record<string, any>) {
        const startTime = this.marks.get(label)
        if (!startTime) {
            this.logger.warn(`Performance mark "${label}" not found`)
            return
        }

        const duration = performance.now() - startTime
        this.marks.delete(label)

        this.logger.performance(`${label} completed`, duration, context)

        // Warn if operation took too long
        if (duration > 1000) {
            this.logger.warn(`Slow operation: ${label} took ${duration.toFixed(2)}ms`, context)
        }

        return duration
    }

    /**
     * Measure async function execution
     */
    async measure<T>(
        label: string,
        fn: () => Promise<T>,
        context?: Record<string, any>
    ): Promise<T> {
        this.start(label)
        try {
            const result = await fn()
            this.end(label, context)
            return result
        } catch (error) {
            this.end(label, { ...context, error: true })
            throw error
        }
    }
}

// Export singleton instances
export const logger = new Logger()
export const performanceLogger = new PerformanceLogger(logger)

/**
 * Initialize logger with user ID when user logs in
 */
export function initializeLogger(userId: string) {
    logger.setUserId(userId)
    logger.info('User logged in', { userId })
}

/**
 * Log API request
 */
export function logAPIRequest(
    method: string,
    endpoint: string,
    duration: number,
    status: number,
    error?: any
) {
    const context = {
        method,
        endpoint,
        duration,
        status,
        error: error ? { message: error.message, code: error.code } : undefined,
    }

    if (status >= 500) {
        logger.error(`API Error: ${method} ${endpoint}`, error, context)
    } else if (status >= 400) {
        logger.warn(`API Client Error: ${method} ${endpoint}`, context)
    } else {
        logger.info(`API Success: ${method} ${endpoint}`, context)
    }
}
