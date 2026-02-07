import { Resend } from 'resend';

/**
 * Servicio de email usando Resend
 * Documentación: https://resend.com/docs
 */
export class ResendEmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = 'Altoke <admin@altoke.tech>';
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error('[Email] Error enviando email:', error);
      throw new Error(`Error enviando email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(to: string, fullName: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Bienvenido a Altoke',
      html: `
        <h1>¡Hola ${fullName}!</h1>
        <p>Bienvenido a Altoke. Tu cuenta ha sido creada exitosamente.</p>
        <p>Ya puedes empezar a enviar remesas de forma rápida y segura.</p>
      `,
    });
  }

  async sendTransactionConfirmation(
    to: string,
    amount: number,
    txHash: string
  ): Promise<void> {
    const explorerUrl =
      process.env.NEXT_PUBLIC_BASESCAN_URL || 'https://sepolia.basescan.org';

    await this.sendEmail({
      to,
      subject: 'Transacción completada - Altoke',
      html: `
        <h1>Transacción Completada</h1>
        <p>Tu transferencia de $${amount.toFixed(2)} USDC ha sido procesada exitosamente.</p>
        <p>Hash de transacción: <code>${txHash}</code></p>
        <p><a href="${explorerUrl}/tx/${txHash}">Ver en BaseScan</a></p>
      `,
    });
  }
}

export const resendEmailService = new ResendEmailService();
