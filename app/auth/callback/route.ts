import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Callback route para el flujo OAuth (PKCE).
 * Supabase redirige aquí después de que el usuario se autentica con Google.
 * Intercambia el código de autorización por una sesión y crea el perfil
 * si es un usuario nuevo (primer login con Google).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (!code) {
    // Sin código de autorización, redirigir a login con error
    return NextResponse.redirect(
      new URL('/login?error=No se recibió código de autorización', origin)
    );
  }

  // Crear cliente Supabase con manejo de cookies en la response
  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Intercambiar código por sesión
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[Auth Callback] Error intercambiando código:', exchangeError);
    return NextResponse.redirect(
      new URL('/login?error=Error al verificar la autenticación', origin)
    );
  }

  // Obtener el usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Verificar si ya tiene perfil (usuario existente vs nuevo)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Primer login con Google: crear perfil automáticamente
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Usuario';

      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: fullName,
        phone: user.user_metadata?.phone || null,
        country: 'PE',
        kyc_status: 'pending',
        kyc_level: 0,
      });

      if (profileError) {
        console.error('[Auth Callback] Error creando perfil para OAuth user:', profileError);
        // No bloqueamos el login; el perfil se creará después via getProfile()
      }
    }
  }

  return response;
}
