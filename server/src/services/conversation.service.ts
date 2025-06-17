import { AppDataSource } from "../data-source";

import { Repository } from "typeorm";
import { Conversation } from "../entities/conversation.entity";
import { UUID } from "../types";
import { NotFoundError, ValidationError } from "../helpers/errors.helper";
import { LogReferenceTypes } from "../constants/logs.constants";
import { ConversationStatus } from "../constants/conversation.constants";
import { UserService } from "./user.service";
import { validateCreateConversation } from "../validations/conversation.validations";
export class ConversationService {
  private readonly conversationRepository: Repository<Conversation>;
  private readonly userService: UserService;

  constructor() {
    this.conversationRepository = AppDataSource.getRepository(Conversation);
    this.userService = new UserService();
  }

  // CREATE CONVERSATION
  async createConversation(
    conversation: Partial<Conversation>
  ): Promise<Conversation> {
    const { error } = validateCreateConversation(conversation);

    if (error) {
      throw new ValidationError(error?.message);
    }

    if (!conversation.recipientId) {
      throw new ValidationError("Recipient ID is required");
    }

    // CHECK IF THE RECIPIENT EXISTS
    const recipient = await this.userService.getUserById(
      conversation?.recipientId
    );

    // CHECK IF THERE ARE OTHER ACTIVE CONVERSATIONS FOR THE SAME PHONE NUMBER
    const existingConversation = await this.getConversationsByRecipientId(
      recipient?.id,
      ConversationStatus.ACTIVE
    );

    if (existingConversation?.length) {
      // INACTIVE ALL EXISTING CONVERSATIONS FOR THE SAME PHONE NUMBER
      await this.conversationRepository.update(
        { recipientId: recipient?.id },
        { status: ConversationStatus.INACTIVE }
      );
    }

    return this.conversationRepository.save(conversation);
  }

  // GET CONVERSATION BY ID
  async getConversationById(id: UUID): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ["recipient"],
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found", {
        referenceId: id,
        referenceType: LogReferenceTypes.CONVERSATION,
      });
    }

    return conversation;
  }

  // GET CONVERSATION BY PHONE NUMBER
  async getConversationsByRecipientId(
    recipientId: UUID,
    status?: ConversationStatus
  ): Promise<Conversation[]> {
    const conversations = await this.conversationRepository.find({
      where: { recipientId, status },
      relations: ["recipient"],
      order: {
        updatedAt: "DESC",
      },
    });

    return conversations;
  }

  // UPDATE CONVERSATION
  async updateConversation(
    id: UUID,
    conversation: Partial<Conversation>
  ): Promise<Conversation> {
    // CHECK IF THE CONVERSATION EXISTS
    const conversationExists = await this.getConversationById(id);

    // UPDATE THE CONVERSATION
    return this.conversationRepository.save({
      ...conversationExists,
      ...conversation,
    });
  }
}
