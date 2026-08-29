import { Repository } from "typeorm";
import { Message } from "../entities/message.entity";
import { AppDataSource } from "../data-source";
import { ConversationService } from "./conversation.service";
import { ValidationError } from "../helpers/errors.helper";
import { ConversationStatus } from "../constants/conversation.constants";
import {
  MessageDirection,
  WhatsAppMessageStatus,
} from "../constants/message.constants";
import { UUID } from "../types";

export class MessageService {
  private readonly messageRepository: Repository<Message>;
  private readonly conversationService: ConversationService;

  constructor() {
    this.messageRepository = AppDataSource.getRepository(Message);
    this.conversationService = new ConversationService();
  }

  async createMessage(message: Partial<Message>): Promise<Message> {
    // IF THERE IS NO CONVERSATION ID, CREATE A NEW CONVERSATION
    if (!message?.conversationId) {
      throw new ValidationError("Conversation ID is required");
    }

    // CHECK IF THE CONVERSATION EXISTS
    const conversation = await this.conversationService.getConversationById(
      message?.conversationId
    );

    // IF THE CONVERSATION IS NOT ACTIVE, THROW AN ERROR
    if (conversation?.status !== ConversationStatus.ACTIVE) {
      throw new ValidationError("Conversation is not active");
    }

    return this.messageRepository.save(message);
  }

  async createInboundIfNew(params: {
    conversationId: UUID;
    externalMessageId?: string | null;
    content: Record<string, any>;
  }): Promise<Message | null> {
    if (params.externalMessageId) {
      const existing = await this.messageRepository.findOne({
        where: { externalMessageId: params.externalMessageId },
      });
      if (existing) return null;
    }
    const saved = await this.createMessage({
      conversationId: params.conversationId,
      externalMessageId: params.externalMessageId,
      content: params.content,
      direction: MessageDirection.INBOUND,
    });
    await this.conversationService.updateConversation(params.conversationId, {
      lastCustomerMessageAt: new Date(),
    });
    return saved;
  }

  async recordOutbound(params: {
    conversationId: UUID;
    externalMessageId?: string | null;
    content: Record<string, any>;
  }): Promise<Message> {
    return this.messageRepository.save({
      conversationId: params.conversationId,
      externalMessageId: params.externalMessageId,
      content: params.content,
      direction: MessageDirection.OUTBOUND,
      deliveryStatus: WhatsAppMessageStatus.SENT,
    });
  }

  async updateDeliveryStatus(
    externalMessageId: string,
    status: WhatsAppMessageStatus,
    content?: Record<string, any>,
  ): Promise<boolean> {
    const message = await this.messageRepository.findOne({
      where: { externalMessageId },
    });
    if (!message) return false;
    message.deliveryStatus = status;
    if (content) message.content = { ...message.content, statusWebhook: content };
    await this.messageRepository.save(message);
    return true;
  }
}
