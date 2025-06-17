import { Repository } from "typeorm";
import { Message } from "../entities/message.entity";
import { AppDataSource } from "../data-source";
import { ConversationService } from "./conversation.service";
import { ValidationError } from "../helpers/errors.helper";
import { ConversationStatus } from "../constants/conversation.constants";

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
}
