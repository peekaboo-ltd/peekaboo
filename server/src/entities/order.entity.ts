import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { AbstractEntity } from "./index";
import { User } from "./user.entity";
import { UUID } from "../types";
import { OrderStatus, OrderType } from "../constants/order.constants";
import { Conversation } from "./conversation.entity";
import { OrderAssignment } from "./orderAssignment.entity";
import { OrderActivity } from "./orderActivity.entity";

@Entity("orders")
export class  Order extends AbstractEntity {
  // REFERENCE ID
  @Column({ name: "reference_id", type: "varchar", length: 255 })
  referenceId: string;

  // RECIPIENT ID
  @Column({ name: "recipient_id", type: "uuid", nullable: true })
  recipientId: UUID;

  // SENDER ID
  @Column({ name: "sender_id", type: "uuid", nullable: true })
  senderId: UUID;

  // CREATED BY ID
  @Column({ name: "created_by_id", type: "uuid", nullable: false })
  createdById: UUID;

  // INITIAL FEE
  @Column({ name: "initial_fee", type: "numeric", nullable: false })
  initialFee: number;

  // TYPE
  @Column({
    name: "type",
    type: "enum",
    nullable: false,
    enum: OrderType,
    default: OrderType.SEND,
  })
  type: OrderType;

  // DISCOUNT
  @Column({ name: "discount", type: "numeric", nullable: true, default: 0 })
  discount: number;

  // FINAL FEE
  @Column({ name: "final_fee", type: "numeric", nullable: true })
  finalFee: number;

  // CONVERSATION ID
  @Column({ name: "conversation_id", type: "uuid", nullable: true })
  conversationId: UUID;

  // LOCATION FROM
  @Column({ name: "location_from", type: "jsonb", nullable: true })
  locationFrom: {
    latitude: number;
    longitude: number;
  };

  // LOCATION TO
  @Column({ name: "location_to", type: "jsonb", nullable: true })
  locationTo: {
    latitude: number;
    longitude: number;
  };

  // PICKUP LOCATION (Address)
  @Column({ name: "pickup_location", type: "text", nullable: true })
  pickupLocation: string;

  // DELIVERY LOCATION (Address)
  @Column({ name: "delivery_location", type: "text", nullable: true })
  deliveryLocation: string;

  // PICKUP COORDINATES
  @Column({ name: "pickup_coordinates", type: "varchar", length: 100, nullable: true })
  pickupCoordinates: string; // Format: "lat,lng"

  // DELIVERY COORDINATES
  @Column({ name: "delivery_coordinates", type: "varchar", length: 100, nullable: true })
  deliveryCoordinates: string; // Format: "lat,lng"

  // DISTANCE (in kilometers)
  @Column({ name: "distance", type: "numeric", nullable: true })
  distance: number;

  // RIDER ID
  @Column({ name: "rider_id", type: "uuid", nullable: true })
  riderId: UUID;

  /**
   * RELATIONS
   */

  // RECIPIENT
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "recipient_id" })
  recipient: User;

  // CREATED BY
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "created_by_id" })
  createdBy: User;

  // SENDER
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "sender_id" })
  sender: User;

  // ORDER ACTIVITIES
  @OneToMany(() => OrderActivity, (orderActivity) => orderActivity.order)
  activities: OrderActivity[];

  // ASSIGNMENTS
  @OneToMany(() => OrderAssignment, (orderAssignment) => orderAssignment.order)
  assignments: OrderAssignment[];

  // CONVERSATION
  @ManyToOne(() => Conversation, (conversation) => conversation.id)
  @JoinColumn({ name: "conversation_id" })
  conversation: Conversation;
}
