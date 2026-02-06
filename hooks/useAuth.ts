'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/infrastructure/database/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook para gestión de autenticación
 */
export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabase = createClient();

  useEffect(() => {
    // Obtener sesión actual
    const getSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });
    };

    getSession();

    // Escuchar cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user || null,
        isLoading: false,
        isAuthenticated: !!session?.user,
      });
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, [supabase.auth]);

  const refreshSession = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    });
  }, [supabase.auth]);

  return { ...state, signOut, refreshSession };
}
