'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@/lib/infrastructure/database/supabase/server';

// Schemas de validación
const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const SignupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  country: z.string().default('PE'),
});

export type AuthActionResult = {
  success: boolean;
  error?: string;
  fields?: Record<string, string[]>;
};

export async function loginUser(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validatedFields = LoginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Datos de inicio de sesión inválidos',
      fields: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    });

    if (error) {
      // Mapear errores comunes de Supabase a mensajes en español
      if (error.message === 'Invalid login credentials') {
        return {
          success: false,
          error: 'Email o contraseña incorrectos.',
        };
      }
      if (error.message === 'Email not confirmed') {
        return {
          success: false,
          error: 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
        };
      }
      return {
        success: false,
        error: 'Error al iniciar sesión. Intenta de nuevo.',
      };
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Error en login:', error);
    return {
      success: false,
      error: 'Error al iniciar sesión. Verifica tus credenciales.',
    };
  }
}

export async function registerUser(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    country: formData.get('country'),
  };

  const validatedFields = SignupSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Datos de registro inválidos',
      fields: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const supabase = createClient();

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      options: {
        data: {
          full_name: validatedFields.data.fullName,
          phone: validatedFields.data.phone || null,
          country: validatedFields.data.country,
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return {
          success: false,
          error: 'Este email ya está registrado. Intenta iniciar sesión.',
        };
      }
      console.error('[Auth] Error en registro:', authError);
      return {
        success: false,
        error: 'Error al crear la cuenta. Intenta de nuevo.',
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Error al crear la cuenta. Intenta de nuevo.',
      };
    }

    // 2. Insertar perfil en la tabla profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: validatedFields.data.fullName,
      phone: validatedFields.data.phone || null,
      country: validatedFields.data.country,
      kyc_status: 'pending',
      kyc_level: 0,
    });

    if (profileError) {
      console.error('[Auth] Error creando perfil:', profileError);
      // El usuario se creó en auth pero falló el perfil.
      // No bloqueamos el registro; el perfil se puede crear después.
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('[Auth] Error inesperado en registro:', error);
    return {
      success: false,
      error: 'Error al crear la cuenta. Intenta de nuevo.',
    };
  }
}

/**
 * Inicia el flujo OAuth con Google usando Supabase (PKCE flow).
 * Retorna la URL de autorización a la que el cliente debe redirigir.
 */
export async function signInWithGoogle(): Promise<AuthActionResult & { url?: string }> {
  try {
    const supabase = createClient();

    // Construir la URL de callback usando el origin de la request
    const headersList = headers();
    const origin = headersList.get('origin') || headersList.get('referer')?.split('/').slice(0, 3).join('/') || '';
    const redirectTo = `${origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[Auth] Error iniciando OAuth con Google:', error);
      return {
        success: false,
        error: 'Error al iniciar sesión con Google. Intenta de nuevo.',
      };
    }

    if (!data.url) {
      return {
        success: false,
        error: 'No se pudo generar la URL de autenticación.',
      };
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error('[Auth] Error inesperado en OAuth Google:', error);
    return {
      success: false,
      error: 'Error al iniciar sesión con Google.',
    };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('[Auth] Error al cerrar sesión:', error);
  }

  redirect('/login');
}
