import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { AbstractEntity } from "./index";
import { UUID } from "../types";
import { User } from "./user.entity";
import { Message } from "./message.entity";
import {
  ConversationStatus,
  ConversationStep,
} from "../constants/conversation.constants";
import { Order } from "./order.entity";

@Entity("conversations")
export class Conversation extends AbstractEntity {
  // RECIPIENT ID
  @Column({ name: "recipient_id", type: "uuid", nullable: false })
  recipientId!: UUID;

  // STEP
  @Column({
    name: "step",
    type: "enum",
    enum: ConversationStep,
    nullable: true,
    default: ConversationStep.INITIATION,
  })
  step: ConversationStep;

  // STATUS
  @Column({
    name: "status",
    type: "enum",
    enum: ConversationStatus,
    nullable: true,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Column({ name: "last_customer_message_at", type: "timestamptz", nullable: true })
  lastCustomerMessageAt?: Date | null;

  /**
   * RELATIONS
   */

  // RECIPIENT
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "recipient_id" })
  recipient: User;

  // MESSAGES
  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  // ORDERS
  @OneToMany(() => Order, (order) => order.conversation)
  orders: Order[];
}
