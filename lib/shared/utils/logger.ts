type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Logger simple para la aplicación
 * En producción, se puede reemplazar por un servicio como DataDog, Sentry, etc.
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatEntry(entry: LogEntry): string {
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (this.isDevelopment) {
      const formatted = this.formatEntry(entry);

      switch (level) {
        case 'debug':
          // Solo en desarrollo
          break;
        case 'info':
          // No usar console.log en producción
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted);
          break;
      }
    } else {
      // En producción: enviar a servicio de logging externo
      // TODO: Integrar con servicio de logging
      if (level === 'error' || level === 'warn') {
        console.error(this.formatEntry(entry));
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
