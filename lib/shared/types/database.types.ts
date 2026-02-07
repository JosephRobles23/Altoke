/**
 * Tipos de base de datos generados por Supabase
 * TODO: Regenerar con `npx supabase gen types typescript`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          country: string;
          kyc_status: string;
          kyc_level: number;
          kyc_data: Json | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          country?: string;
          kyc_status?: string;
          kyc_level?: number;
          kyc_data?: Json | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          country?: string;
          kyc_status?: string;
          kyc_level?: number;
          kyc_data?: Json | null;
          metadata?: Json | null;
          updated_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          private_key_encrypted: string;
          balance_eth: number;
          balance_usdc: number;
          is_active: boolean;
          network: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address: string;
          private_key_encrypted: string;
          balance_eth?: number;
          balance_usdc?: number;
          is_active?: boolean;
          network?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          address?: string;
          private_key_encrypted?: string;
          balance_eth?: number;
          balance_usdc?: number;
          is_active?: boolean;
          network?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string | null;
          to_address: string | null;
          type: string;
          status: string;
          amount_usdc: number;
          amount_pen: number | null;
          exchange_rate: number | null;
          fee_usdc: number;
          fee_platform: number;
          tx_hash: string | null;
          block_number: number | null;
          gas_used: number | null;
          description: string | null;
          metadata: Json | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id?: string | null;
          to_address?: string | null;
          type: string;
          status?: string;
          amount_usdc: number;
          amount_pen?: number | null;
          exchange_rate?: number | null;
          fee_usdc?: number;
          fee_platform?: number;
          tx_hash?: string | null;
          block_number?: number | null;
          gas_used?: number | null;
          description?: string | null;
          metadata?: Json | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          from_user_id?: string;
          to_user_id?: string | null;
          to_address?: string | null;
          type?: string;
          status?: string;
          amount_usdc?: number;
          amount_pen?: number | null;
          exchange_rate?: number | null;
          fee_usdc?: number;
          fee_platform?: number;
          tx_hash?: string | null;
          block_number?: number | null;
          gas_used?: number | null;
          description?: string | null;
          metadata?: Json | null;
          error_message?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      onramp_transactions: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_order_id: string;
          fiat_amount: number;
          fiat_currency: string;
          crypto_amount: number | null;
          crypto_currency: string;
          status: string;
          provider_status: string | null;
          provider_data: Json | null;
          webhook_data: Json | null;
          created_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          provider_order_id: string;
          fiat_amount: number;
          fiat_currency: string;
          crypto_amount?: number | null;
          crypto_currency?: string;
          status?: string;
          provider_status?: string | null;
          provider_data?: Json | null;
          webhook_data?: Json | null;
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          provider?: string;
          provider_order_id?: string;
          fiat_amount?: number;
          fiat_currency?: string;
          crypto_amount?: number | null;
          crypto_currency?: string;
          status?: string;
          provider_status?: string | null;
          provider_data?: Json | null;
          webhook_data?: Json | null;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      exchange_rates: {
        Row: {
          id: string;
          from_currency: string;
          to_currency: string;
          rate: number;
          provider: string;
          valid_until: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_currency: string;
          to_currency: string;
          rate: number;
          provider: string;
          valid_until: string;
          created_at?: string;
        };
        Update: {
          from_currency?: string;
          to_currency?: string;
          rate?: number;
          provider?: string;
          valid_until?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: Json | null;
          is_read?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
