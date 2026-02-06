'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

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
    // TODO: Implementar con Supabase Auth
    // const supabase = createClient();
    // const { error } = await supabase.auth.signInWithPassword(validatedFields.data);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
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
    // TODO: Implementar con Supabase Auth + CreateWallet use case
    // 1. Supabase Auth: createUser()
    // 2. Supabase DB: insert into profiles
    // 3. Use Case: CreateWallet (Hedera)

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Error al crear la cuenta. Intenta de nuevo.',
    };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    // TODO: Implementar con Supabase Auth
    // const supabase = createClient();
    // await supabase.auth.signOut();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }

  redirect('/login');
}
