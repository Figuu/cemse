import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export interface NotificationData {
  userId: string;
  type: 'job_application' | 'job_offer' | 'youth_application' | 'message' | 'course' | 'certificate' | 'system';
  title: string;
  message: string;
  data?: Record<string, string | number | boolean | null>;
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  jobApplications: boolean;
  jobOffers: boolean;
  messages: boolean;
  courses: boolean;
  certificates: boolean;
}

export class NotificationService {
  /**
   * Send notification to user
   */
  static async sendNotification(notificationData: NotificationData): Promise<void> {
    try {
      // Get user preferences
      const user = await prisma.user.findUnique({
        where: { id: notificationData.userId },
        include: { profile: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create in-app notification
      if (notificationData.inApp !== false) {
        await this.createInAppNotification(notificationData);
      }

      // Send email notification
      if (notificationData.email && user.email) {
        await this.sendEmailNotification(notificationData, user.email);
      }

      // Send push notification (placeholder for future implementation)
      if (notificationData.push) {
        await this.sendPushNotification(notificationData);
      }

    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Create in-app notification
   * Note: This is a placeholder implementation since the Notification model doesn't exist in the schema yet
   */
  private static async createInAppNotification(data: NotificationData): Promise<void> {
    // TODO: Implement notification storage when Notification model is added to schema
    console.log('In-app notification would be created:', data);
  }

  /**
   * Send email notification using Resend
   */
  private static async sendEmailNotification(data: NotificationData, email: string): Promise<void> {
    const template = this.getEmailTemplate(data);
    
    await resend.emails.send({
      from: 'CEMSE <noreply@cemse.com>',
      to: [email],
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send push notification (placeholder)
   */
  private static async sendPushNotification(data: NotificationData): Promise<void> {
    // TODO: Implement push notification service (Firebase, OneSignal, etc.)
    console.log('Push notification would be sent:', data);
  }

  /**
   * Get email template based on notification type
   */
  private static getEmailTemplate(data: NotificationData): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    switch (data.type) {
      case 'job_application':
        return {
          subject: `Nueva aplicación de trabajo - ${data.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Nueva Aplicación de Trabajo</h2>
              <p>Hola,</p>
              <p>Has recibido una nueva aplicación para el puesto: <strong>${data.title}</strong></p>
              <p>${data.message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/companies/${data.data?.companyId}/applications" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Ver Aplicación
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Este es un mensaje automático de CEMSE.
              </p>
            </div>
          `,
          text: `Nueva aplicación de trabajo - ${data.title}\n\n${data.message}\n\nVer aplicación: ${baseUrl}/companies/${data.data?.companyId}/applications`
        };

      case 'job_offer':
        return {
          subject: `Nueva oferta de trabajo - ${data.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Nueva Oferta de Trabajo</h2>
              <p>Hola,</p>
              <p>Se ha publicado una nueva oferta de trabajo que podría interesarte: <strong>${data.title}</strong></p>
              <p>${data.message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/jobs/${data.data?.jobId}" 
                   style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Ver Oferta
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Este es un mensaje automático de CEMSE.
              </p>
            </div>
          `,
          text: `Nueva oferta de trabajo - ${data.title}\n\n${data.message}\n\nVer oferta: ${baseUrl}/jobs/${data.data?.jobId}`
        };

      case 'youth_application':
        return {
          subject: `Interés en tu aplicación - ${data.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Interés en tu Aplicación</h2>
              <p>Hola,</p>
              <p>Una empresa ha mostrado interés en tu aplicación: <strong>${data.title}</strong></p>
              <p>${data.message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/applications/youth" 
                   style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Ver Aplicación
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Este es un mensaje automático de CEMSE.
              </p>
            </div>
          `,
          text: `Interés en tu aplicación - ${data.title}\n\n${data.message}\n\nVer aplicación: ${baseUrl}/applications/youth`
        };

      case 'message':
        return {
          subject: `Nuevo mensaje - ${data.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Nuevo Mensaje</h2>
              <p>Hola,</p>
              <p>Has recibido un nuevo mensaje: <strong>${data.title}</strong></p>
              <p>${data.message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/messages" 
                   style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Ver Mensaje
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Este es un mensaje automático de CEMSE.
              </p>
            </div>
          `,
          text: `Nuevo mensaje - ${data.title}\n\n${data.message}\n\nVer mensaje: ${baseUrl}/messages`
        };

      case 'course':
        return {
          subject: `Actualización del curso - ${data.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ea580c;">Actualización del Curso</h2>
              <p>Hola,</p>
              <p>Hay una actualización en el curso: <strong>${data.title}</strong></p>
              <p>${data.message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/courses/${data.data?.courseId}" 
                   style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Ver Curso
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Este es un mensaje automático de CEMSE.
              </p>
            </div>
          `,
          text: `Actualización del curso - ${data.title}\n\n${data.message}\n\nVer curso: ${baseUrl}/courses/${data.data?.courseId}`
        };

      case 'certificate':
        return {
          subject: `¡Certificado obtenido! - ${data.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">¡Felicitaciones!</h2>
              <p>Hola,</p>
              <p>Has obtenido un nuevo certificado: <strong>${data.title}</strong></p>
              <p>${data.message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/certificates" 
                   style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Ver Certificado
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Este es un mensaje automático de CEMSE.
              </p>
            </div>
          `,
          text: `¡Certificado obtenido! - ${data.title}\n\n${data.message}\n\nVer certificado: ${baseUrl}/certificates`
        };

      default:
        return {
          subject: data.title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${data.title}</h2>
              <p>${data.message}</p>
              <p style="color: #666; font-size: 14px;">
                Este es un mensaje automático de CEMSE.
              </p>
            </div>
          `,
          text: `${data.title}\n\n${data.message}`
        };
    }
  }

  /**
   * Get user notifications
   * Note: This is a placeholder implementation since the Notification model doesn't exist in the schema yet
   */
  static async getUserNotifications(userId: string, _limit = 20, _offset = 0) {
    // TODO: Implement when Notification model is added to schema
    console.log('Getting notifications for user:', userId);
    return [];
  }

  /**
   * Mark notification as read
   * Note: This is a placeholder implementation since the Notification model doesn't exist in the schema yet
   */
  static async markAsRead(notificationId: string, userId: string) {
    // TODO: Implement when Notification model is added to schema
    console.log('Marking notification as read:', notificationId, userId);
    return { count: 0 };
  }

  /**
   * Mark all notifications as read
   * Note: This is a placeholder implementation since the Notification model doesn't exist in the schema yet
   */
  static async markAllAsRead(userId: string) {
    // TODO: Implement when Notification model is added to schema
    console.log('Marking all notifications as read for user:', userId);
    return { count: 0 };
  }

  /**
   * Delete notification
   * Note: This is a placeholder implementation since the Notification model doesn't exist in the schema yet
   */
  static async deleteNotification(notificationId: string, userId: string) {
    // TODO: Implement when Notification model is added to schema
    console.log('Deleting notification:', notificationId, userId);
    return { count: 0 };
  }

  /**
   * Get notification preferences
   * Note: This returns default preferences since notificationPreferences field doesn't exist in User model yet
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    // TODO: Implement when notificationPreferences field is added to User model
    console.log('Getting notification preferences for user:', userId);
    
    return {
      email: true,
      push: true,
      inApp: true,
      jobApplications: true,
      jobOffers: true,
      messages: true,
      courses: true,
      certificates: true
    };
  }

  /**
   * Update notification preferences
   * Note: This is a placeholder implementation since notificationPreferences field doesn't exist in User model yet
   */
  static async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    // TODO: Implement when notificationPreferences field is added to User model
    console.log('Updating notification preferences for user:', userId, preferences);
    return { id: userId };
  }
}