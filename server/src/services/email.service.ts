import logger from "../helpers/logger.helper";

export class EmailService {
  async sendPasswordResetEmail(to: string, tempPassword: string): Promise<void> {
    // In a real implementation, you would use a service like SendGrid, AWS SES, etc.
    // For now, we'll just log the password reset
    logger.info(`Password reset email sent to ${to}`);
    logger.info(`Temporary password: ${tempPassword}`);
    
    // TODO: Implement actual email sending
    // Example with nodemailer:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({
    //   from: 'noreply@peekaboo.com',
    //   to,
    //   subject: 'Password Reset - Peekaboo',
    //   html: `Your temporary password is: ${tempPassword}`
    // });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    logger.info(`Welcome email sent to ${to}`);
    // TODO: Implement actual email sending
  }

  async sendOrderConfirmationEmail(to: string, orderId: string): Promise<void> {
    logger.info(`Order confirmation email sent to ${to} for order ${orderId}`);
    // TODO: Implement actual email sending
  }
}