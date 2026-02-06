import { Transaction } from '@/lib/domain/entities/Transaction';

export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

/**
 * Application Service para notificaciones
 */
export class NotificationService {
  constructor(private emailService?: IEmailService) {}

  async sendTransactionNotification(transaction: Transaction): Promise<void> {
    // TODO: Implementar con Resend
    // 1. Obtener emails del remitente y destinatario
    // 2. Enviar email de confirmación al remitente
    // 3. Enviar email de notificación al destinatario

    console.warn(
      `[Notification] Transaction ${transaction.id} - Status: ${transaction.status}`
    );
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    // TODO: Implementar con Resend
    console.warn(`[Notification] Welcome email sent to ${email}`);
  }

  async sendSecurityAlert(userId: string, message: string): Promise<void> {
    // TODO: Implementar
    console.warn(`[Notification] Security alert for user ${userId}: ${message}`);
  }
}
