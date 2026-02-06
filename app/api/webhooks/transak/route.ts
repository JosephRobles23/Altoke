import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook endpoint para Transak
 * Recibe notificaciones cuando una orden de compra cambia de estado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Validar signature del webhook
    // const signature = request.headers.get('x-transak-signature');
    // if (!validateTransakSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // TODO: Implementar con ProcessWebhook use case
    // 1. Parse payload
    // 2. Actualizar onramp_transaction
    // 3. Si completed: transferir USDC al usuario
    // 4. Actualizar balance del wallet
    // 5. Enviar notificación

    console.warn('Transak webhook received:', body.status);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing Transak webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
