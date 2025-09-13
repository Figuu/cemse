import { prisma } from "@/lib/prisma";

export interface NotificationData {
  type: "APPLICATION_STATUS_CHANGE" | "JOB_ALERT" | "MESSAGE" | "SYSTEM" | "COURSE_UPDATE";
  title: string;
  message: string;
  userId: string;
  data?: Record<string, any>;
  jobApplicationId?: string;
}

export class NotificationService {
  static async createNotification(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          jobApplicationId: data.jobApplicationId,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static async createApplicationStatusNotification(
    applicationId: string,
    oldStatus: string,
    newStatus: string
  ) {
    try {
      // Get application details
      const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          jobOffer: {
            include: {
              company: true,
            },
          },
          applicant: true,
        },
      });

      if (!application) {
        throw new Error("Application not found");
      }

      const { title, message } = this.getApplicationStatusMessage(
        oldStatus,
        newStatus,
        application.jobOffer.title,
        application.jobOffer.company.name
      );

      const notification = await this.createNotification({
        type: "APPLICATION_STATUS_CHANGE",
        title,
        message,
        userId: application.applicantId,
        data: {
          applicationId,
          oldStatus,
          newStatus,
          jobTitle: application.jobOffer.title,
          companyName: application.jobOffer.company.name,
        },
        jobApplicationId: applicationId,
      });

      return notification;
    } catch (error) {
      console.error("Error creating application status notification:", error);
      throw error;
    }
  }

  static async createJobAlertNotification(
    userId: string,
    jobTitle: string,
    companyName: string,
    jobId: string
  ) {
    try {
      const notification = await this.createNotification({
        type: "JOB_ALERT",
        title: "Nueva oferta de trabajo disponible",
        message: `Se ha publicado una nueva oferta: ${jobTitle} en ${companyName}`,
        userId,
        data: {
          jobId,
          jobTitle,
          companyName,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error creating job alert notification:", error);
      throw error;
    }
  }

  static async createMessageNotification(
    userId: string,
    senderName: string,
    messagePreview: string
  ) {
    try {
      const notification = await this.createNotification({
        type: "MESSAGE",
        title: `Nuevo mensaje de ${senderName}`,
        message: messagePreview,
        userId,
        data: {
          senderName,
          messagePreview,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error creating message notification:", error);
      throw error;
    }
  }

  static async createCourseUpdateNotification(
    userId: string,
    courseTitle: string,
    updateType: string
  ) {
    try {
      const notification = await this.createNotification({
        type: "COURSE_UPDATE",
        title: "Actualización de curso",
        message: `${courseTitle}: ${updateType}`,
        userId,
        data: {
          courseTitle,
          updateType,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error creating course update notification:", error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId,
        },
        data: { read: true },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: { userId, read: false },
      });
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  private static getApplicationStatusMessage(
    oldStatus: string,
    newStatus: string,
    jobTitle: string,
    companyName: string
  ): { title: string; message: string } {
    const statusMessages = {
      "SENT": {
        "UNDER_REVIEW": {
          title: "Aplicación en revisión",
          message: `Tu aplicación para ${jobTitle} en ${companyName} está siendo revisada.`,
        },
        "PRE_SELECTED": {
          title: "¡Has sido preseleccionado!",
          message: `¡Excelente! Has sido preseleccionado para ${jobTitle} en ${companyName}.`,
        },
        "REJECTED": {
          title: "Aplicación no seleccionada",
          message: `Tu aplicación para ${jobTitle} en ${companyName} no fue seleccionada en esta ocasión.`,
        },
        "HIRED": {
          title: "¡Felicitaciones! Has sido contratado",
          message: `¡Increíble! Has sido seleccionado para ${jobTitle} en ${companyName}.`,
        },
      },
      "UNDER_REVIEW": {
        "PRE_SELECTED": {
          title: "¡Has sido preseleccionado!",
          message: `¡Excelente! Has sido preseleccionado para ${jobTitle} en ${companyName}.`,
        },
        "REJECTED": {
          title: "Aplicación no seleccionada",
          message: `Tu aplicación para ${jobTitle} en ${companyName} no fue seleccionada en esta ocasión.`,
        },
        "HIRED": {
          title: "¡Felicitaciones! Has sido contratado",
          message: `¡Increíble! Has sido seleccionado para ${jobTitle} en ${companyName}.`,
        },
      },
      "PRE_SELECTED": {
        "REJECTED": {
          title: "Aplicación no seleccionada",
          message: `Tu aplicación para ${jobTitle} en ${companyName} no fue seleccionada en esta ocasión.`,
        },
        "HIRED": {
          title: "¡Felicitaciones! Has sido contratado",
          message: `¡Increíble! Has sido seleccionado para ${jobTitle} en ${companyName}.`,
        },
      },
    };

    const statusTransition = statusMessages[oldStatus as keyof typeof statusMessages]?.[newStatus as keyof typeof statusMessages[typeof oldStatus]];

    if (statusTransition) {
      return statusTransition;
    }

    // Fallback for unknown status transitions
    return {
      title: "Estado de aplicación actualizado",
      message: `El estado de tu aplicación para ${jobTitle} en ${companyName} ha cambiado a ${newStatus}.`,
    };
  }
}
