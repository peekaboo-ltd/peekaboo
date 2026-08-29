import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from ".";
import { UUID } from "../types";
import { Conversation } from "./conversation.entity";
import {
  MessageChannel,
  MessageDirection,
  WhatsAppMessageStatus,
} from "../constants/message.constants";

@Entity("messages")
export class Message extends AbstractEntity {
  // CONVERSATION ID
  @Column({ name: "conversation_id", type: "uuid", nullable: false })
  conversationId: UUID;

  // CONTENT
  @Column({
    name: "content",
    type: "jsonb",
    nullable: false,
    default: {},
  })
  content: Record<string, any>;

  // CHANNEL
  @Column({
    name: "channel",
    type: "enum",
    nullable: false,
    enum: MessageChannel,
    default: MessageChannel.WHATSAPP,
  })
  channel: MessageChannel;

  @Column({
    name: "direction",
    type: "enum",
    enum: MessageDirection,
    default: MessageDirection.INBOUND,
  })
  direction: MessageDirection;

  @Column({ name: "external_message_id", type: "varchar", nullable: true, unique: true })
  externalMessageId?: string | null;

  @Column({
    name: "delivery_status",
    type: "enum",
    enum: WhatsAppMessageStatus,
    nullable: true,
  })
  deliveryStatus?: WhatsAppMessageStatus | null;

  /**
   * RELATIONS
   */

  // CONVERSATION
  @ManyToOne(() => Conversation, (conversation) => conversation.id)
  @JoinColumn({ name: "conversation_id" })
  conversation: Conversation;
}
