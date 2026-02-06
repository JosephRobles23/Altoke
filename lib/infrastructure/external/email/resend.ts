/**
 * Servicio de email usando Resend
 * Documentación: https://resend.com/docs
 */
export class ResendEmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = 'noreply@altoke.app';
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    // TODO: Implementar con Resend SDK
    // const resend = new Resend(this.apiKey);
    // await resend.emails.send({
    //   from: this.fromEmail,
    //   to: params.to,
    //   subject: params.subject,
    //   html: params.html,
    // });

    console.warn(`[Email] Sending to ${params.to}: ${params.subject}`);
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
    await this.sendEmail({
      to,
      subject: 'Transacción completada - Altoke',
      html: `
        <h1>Transacción Completada</h1>
        <p>Tu transferencia de $${amount.toFixed(2)} USDC ha sido procesada exitosamente.</p>
        <p>Hash de transacción: <code>${txHash}</code></p>
        <p><a href="https://hashscan.io/testnet/transaction/${txHash}">Ver en explorador</a></p>
      `,
    });
  }
}

export const resendEmailService = new ResendEmailService();
