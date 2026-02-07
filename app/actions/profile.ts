'use server';

import { createClient } from '@/lib/infrastructure/database/supabase/server';

export type ProfileActionResult = {
  success: boolean;
  data?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    country: string;
    kycStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
    kycLevel: number;
  };
  error?: string;
};

/**
 * Obtiene el perfil del usuario autenticado, incluyendo datos KYC
 */
export async function getProfile(): Promise<ProfileActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    // Obtener perfil de la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, country, kyc_status, kyc_level')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Si no existe el perfil, puede ser un usuario que se registró
      // pero el insert del perfil falló. Intentar crearlo.
      if (profileError?.code === 'PGRST116') {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          phone: user.user_metadata?.phone || null,
          country: user.user_metadata?.country || 'PE',
          kyc_status: 'pending',
          kyc_level: 0,
        });

        if (insertError) {
          console.error('[Profile] Error creando perfil faltante:', insertError);
          return { success: false, error: 'Error al obtener el perfil.' };
        }

        // Reintentar obtener el perfil recién creado
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('id, full_name, phone, country, kyc_status, kyc_level')
          .eq('id', user.id)
          .single();

        if (newProfile) {
          return {
            success: true,
            data: {
              id: newProfile.id,
              fullName: newProfile.full_name,
              email: user.email || '',
              phone: newProfile.phone,
              country: newProfile.country,
              kycStatus: newProfile.kyc_status as 'pending' | 'in_review' | 'approved' | 'rejected',
              kycLevel: newProfile.kyc_level,
            },
          };
        }
      }

      console.error('[Profile] Error obteniendo perfil:', profileError);
      return { success: false, error: 'Error al obtener el perfil.' };
    }

    return {
      success: true,
      data: {
        id: profile.id,
        fullName: profile.full_name,
        email: user.email || '',
        phone: profile.phone,
        country: profile.country,
        kycStatus: profile.kyc_status as 'pending' | 'in_review' | 'approved' | 'rejected',
        kycLevel: profile.kyc_level,
      },
    };
  } catch (error) {
    console.error('[Profile] Error inesperado:', error);
    return {
      success: false,
      error: 'Error al obtener el perfil.',
    };
  }
}
