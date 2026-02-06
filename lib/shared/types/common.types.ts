/**
 * Tipos comunes de la aplicación
 */

// Resultado genérico de Server Actions
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fields?: Record<string, string[]>;
}

// Paginación
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Filtros de transacciones
export interface TransactionFilters {
  type?: 'send' | 'receive' | 'buy' | 'sell';
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  dateFrom?: Date;
  dateTo?: Date;
}

// Tipos de notificación
export type NotificationType = 'transaction' | 'kyc' | 'security' | 'marketing';
