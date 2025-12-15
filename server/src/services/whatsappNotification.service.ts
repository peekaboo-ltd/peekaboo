import { sendMessage } from '../helpers/whatsapp.helper';
import { generateMemorablePassword } from '../helpers/password.helper';
import { hashPassword } from '../helpers/auth.helper';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';

export class WhatsAppNotificationService {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Send login credentials to new user via WhatsApp
   */
  async sendWelcomeCredentials(user: User, password: string): Promise<void> {
    try {
      const message = `🎉 Welcome to Peekaboo Delivery!

Your account has been created successfully.

📱 *Phone Number:* ${user.phoneNumber}
🔑 *Temporary Password:* ${password}

Please login and change your password for security.

Login here: ${process.env.CLIENT_URL || 'https://peekaboo.rw'}/auth/login

Need help? Reply to this message.`;

      await sendMessage({
        phoneNumber: user.phoneNumber,
        type: 'text',
        message: message,
      });
    } catch (error) {
      console.error('Failed to send WhatsApp welcome message:', error);
    }
  }


  async sendOrderConfirmationToSender(order: any): Promise<void> {
    try {
      const message = `✅ *Order Confirmed* - ${order.referenceId}

Your delivery order has been created!

📦 *Pickup:* ${order.pickupLocation || 'To be confirmed'}
📍 *Delivery:* ${order.deliveryLocation || 'To be confirmed'}
💰 *Total Fee:* ${order.finalFee} RWF

Track your order: ${process.env.CLIENT_URL || 'https://peekaboo.rw'}/p/orders/${order.id}

We'll notify you once a rider is assigned.`;

      await sendMessage({
        phoneNumber: order.sender?.phoneNumber,
        type: 'text',
        message: message,
      });
    } catch (error) {
      console.error('Failed to send order confirmation to sender:', error);
    }
  }

  /**
   * Send order notification to recipient
   */
  async sendOrderNotificationToRecipient(order: any): Promise<void> {
    try {
      const message = `📦 *Incoming Delivery* - ${order.referenceId}

Someone is sending you a package!

👤 *From:* ${order.sender?.phoneNumber}
📍 *Delivery Location:* ${order.deliveryLocation || 'To be confirmed'}
💰 *Delivery Fee:* ${order.finalFee} RWF

Track this delivery: ${process.env.CLIENT_URL || 'https://peekaboo.rw'}/p/orders/${order.id}

You'll receive updates as the package moves.`;

      await sendMessage({
        phoneNumber: order.recipient?.phoneNumber,
        type: 'text',
        message: message,
      });
    } catch (error) {
      console.error('Failed to send order notification to recipient:', error);
    }
  }

  /**
   * Send rider assignment notification to all parties
   */
  async sendRiderAssignedNotification(order: any, rider: User): Promise<void> {
    try {
      // Notify sender
      await sendMessage({
        phoneNumber: order.sender?.phoneNumber,
        type: 'text',
        message: `🚴 *Rider Assigned* - ${order.referenceId}

Your package has been assigned to a rider!

🚴 *Rider:* ${rider.name || rider.phoneNumber}
📱 *Contact:* ${rider.phoneNumber}

Track: ${process.env.CLIENT_URL || 'https://peekaboo.rw'}/p/orders/${order.id}`,
      });

      // Notify recipient
      await sendMessage({
        phoneNumber: order.recipient?.phoneNumber,
        type: 'text',
        message: `🚴 *Rider On The Way* - ${order.referenceId}

A rider is coming with your package!

🚴 *Rider:* ${rider.name || rider.phoneNumber}
📱 *Contact:* ${rider.phoneNumber}

Track: ${process.env.CLIENT_URL || 'https://peekaboo.rw'}/p/orders/${order.id}`,
      });
    } catch (error) {
      console.error('Failed to send rider assignment notification:', error);
    }
  }

  /**
   * Create user with random password and send credentials
   */
  async createUserWithCredentials(phoneNumber: string): Promise<User> {
    // Generate random password
    const temporaryPassword = generateMemorablePassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    // Create user
    const user = await this.userService.createUser({
      phoneNumber,
      passwordHash: hashedPassword,
    });

    // Send credentials via WhatsApp
    await this.sendWelcomeCredentials(user, temporaryPassword);

    return user;
  }
}
