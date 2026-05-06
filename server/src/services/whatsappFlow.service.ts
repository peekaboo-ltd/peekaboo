import { ConversationStatus } from '../constants/conversation.constants';
import { PaymentType } from '../constants/payment.constants';
import { RoleTypes } from '../constants/role.constants';
import { KpayCurrency } from '../types/kpay.types';
import { PaymentProvider } from '../types/urubuto.types';
import { ValidationError } from '../helpers/errors.helper';
import { sendCtaUrlMessage } from '../helpers/whatsapp.helper';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { ConversationService } from './conversation.service';
import { UserService } from './user.service';

const DEFAULT_ORDER_FEE = 1500;
const DEFAULT_PAYMENT_SESSION_TTL_HOURS = 5;
const WHATSAPP_CUSTOMER_SERVICE_WINDOW_HOURS = 24;

interface OrderCreateFlowPayload {
  action?: string;
  source?: string;
  sender_phone?: string;
  recipient_phone?: string;
  pickup_address?: string;
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  dropoff_address?: string;
  delivery_notes?: string;
  quoted_fee?: string | number;
  currency?: KpayCurrency | string;
  payment_session_ttl_minutes?: string | number;
  confirmed?: string | boolean;
}

interface HandleOrderCreateFlowInput {
  version?: string;
  action?: string;
  screen?: string;
  flow_token?: string;
  data?: OrderCreateFlowPayload;
}

export class WhatsappFlowService {
  private readonly orderService: OrderService;
  private readonly paymentService: PaymentService;
  private readonly conversationService: ConversationService;
  private readonly userService: UserService;

  constructor() {
    this.orderService = new OrderService();
    this.paymentService = new PaymentService();
    this.conversationService = new ConversationService();
    this.userService = new UserService();
  }

  async handleOrderCreateFlowSubmission(input: HandleOrderCreateFlowInput) {
    if (input.action === 'ping') {
      return {
        version: input.version || '3.0',
        data: {
          status: 'active',
        },
      };
    }

    const data = input.data || {};

    if (data.action !== 'create_order_payment_session') {
      throw new ValidationError('Unsupported WhatsApp Flow action');
    }

    if (!this.isTruthy(data.confirmed)) {
      throw new ValidationError('Order details must be confirmed');
    }

    const configuredFee = Number(
      process.env.WHATSAPP_ORDER_INITIAL_FEE || DEFAULT_ORDER_FEE,
    );
    const quotedFee = Number(data.quoted_fee || configuredFee);

    if (quotedFee !== configuredFee) {
      throw new ValidationError('Quoted fee does not match current order fee');
    }

    const senderPhoneNumber = this.normalizePhoneNumber(data.sender_phone);
    const recipientPhoneNumber = this.normalizePhoneNumber(data.recipient_phone);

    if (!senderPhoneNumber) {
      throw new ValidationError('Sender phone number is required');
    }

    if (!recipientPhoneNumber) {
      throw new ValidationError('Recipient phone number is required');
    }

    if (!data.pickup_address) {
      throw new ValidationError('Pickup address is required');
    }

    if (!data.dropoff_address) {
      throw new ValidationError('Drop-off address is required');
    }

    const sender = await this.userService.createUser(
      { phoneNumber: senderPhoneNumber },
      [RoleTypes.CUSTOMER],
    );
    const conversation = await this.conversationService.getOrCreateActiveWhatsappConversation(
      sender.id,
    );

    if (conversation.status === ConversationStatus.PAYMENT_EXPIRED) {
      await this.conversationService.updateConversation(conversation.id, {
        status: ConversationStatus.ACTIVE,
      });
    }

    const orderNotes = this.buildOrderNotes(data);
    const { order } = await this.orderService.createPublicOrder({
      senderPhoneNumber,
      recipientPhoneNumber,
      conversationId: conversation.id,
      initialFee: configuredFee,
      description: 'Peekaboo WhatsApp Flow order',
      notes: orderNotes,
    });

    const now = new Date();
    const paymentSessionExpiresAt = this.addHours(
      now,
      this.getPaymentSessionTtlHours(),
    );
    const customerServiceWindowExpiresAt = this.addHours(
      now,
      WHATSAPP_CUSTOMER_SERVICE_WINDOW_HOURS,
    );

    const payment = await this.paymentService.createPayment({
      entityId: order.id,
      amount: Number(order.finalFee || order.initialFee || configuredFee),
      currency: KpayCurrency.RWF,
      type: PaymentType.ORDER,
      customerEmail: '',
      customerName: sender.name || sender.phoneNumber || senderPhoneNumber,
      customerPhone: senderPhoneNumber,
      createdById: order.createdById,
      provider: PaymentProvider.URUBUTO,
      description: `Peekaboo order ${order.referenceId}`,
      metadata: {
        source: 'whatsapp_flow',
        conversationId: conversation.id,
        orderId: order.id,
        flowToken: input.flow_token,
        paymentSessionStartedAt: now.toISOString(),
        paymentSessionExpiresAt: paymentSessionExpiresAt.toISOString(),
        whatsappCustomerServiceWindowExpiresAt:
          customerServiceWindowExpiresAt.toISOString(),
        paymentReminderTemplateCandidate: 'peekaboo_payment_expired',
        pickupAddress: data.pickup_address,
        pickupContactName: data.pickup_contact_name,
        pickupContactPhone: data.pickup_contact_phone,
        dropoffAddress: data.dropoff_address,
        deliveryNotes: data.delivery_notes,
      },
    });

    const paymentUrl = payment.paymentUrl || payment.metadata?.paymentUrl;

    if (!paymentUrl) {
      throw new ValidationError('Payment URL was not returned by the provider');
    }

    await sendCtaUrlMessage({
      phoneNumber: senderPhoneNumber,
      bodyText: `Your Peekaboo order ${order.referenceId} is ready. Pay ${configuredFee.toLocaleString()} RWF within 5 hours to confirm rider assignment.`,
      buttonText: `Pay ${configuredFee.toLocaleString()} RWF`,
      url: paymentUrl,
    });

    return {
      version: input.version || '3.0',
      screen: input.screen || 'CONFIRM',
      data: {
        order_reference: order.referenceId,
        tracking_id: order.trackingId,
        payment_link_sent: true,
        payment_session_expires_at: paymentSessionExpiresAt.toISOString(),
      },
    };
  }

  private normalizePhoneNumber(phoneNumber?: string): string | null {
    if (!phoneNumber) return null;

    const digits = phoneNumber.replace(/\D/g, '');

    if (digits.startsWith('2500')) {
      return `250${digits.slice(4)}`;
    }

    if (digits.startsWith('250') && digits.length === 12) {
      return digits;
    }

    if (digits.startsWith('0') && digits.length === 10) {
      return `250${digits.slice(1)}`;
    }

    if (digits.length === 9) {
      return `250${digits}`;
    }

    return null;
  }

  private isTruthy(value?: string | boolean): boolean {
    return value === true || value === 'true' || value === '1' || value === 'on';
  }

  private getPaymentSessionTtlHours(): number {
    const configuredHours = Number(process.env.WHATSAPP_PAYMENT_SESSION_TTL_HOURS);

    return Number.isFinite(configuredHours) && configuredHours > 0
      ? configuredHours
      : DEFAULT_PAYMENT_SESSION_TTL_HOURS;
  }

  private addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  private buildOrderNotes(data: OrderCreateFlowPayload): string {
    return [
      `Pickup: ${data.pickup_address}`,
      data.pickup_contact_name ? `Pickup contact: ${data.pickup_contact_name}` : '',
      data.pickup_contact_phone ? `Pickup contact phone: ${data.pickup_contact_phone}` : '',
      `Drop-off: ${data.dropoff_address}`,
      data.delivery_notes ? `Notes: ${data.delivery_notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }
}
