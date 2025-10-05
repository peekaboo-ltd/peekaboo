import { Column, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from ".";
import { UUID } from "../types";
import { PaymentType } from "../constants/payment.constants";
import { User } from "./user.entity";

export class Payment extends AbstractEntity {
  // ENTITY ID
  @Column({ name: "entity_id", type: "uuid", nullable: false })
  entityId: UUID;

  // INTERNAL REFERENCE ID
  @Column({ name: "internal_reference_id", type: "varchar", nullable: false })
  internalReferenceId: string;

  // AMOUNT
  @Column({ name: "amount", type: "numeric", nullable: false })
  amount: number;

  // CURRENCY
  @Column({ name: "currency", type: "varchar", nullable: false })
  currency: 'RWF' | 'USD';

  // EXTERNAL REFERENCE ID
  @Column({ name: "external_reference_id", type: "varchar", nullable: true })
  externalReferenceId: string;

  // CREATED BY ID
  @Column({ name: "created_by_id", type: "uuid", nullable: false })
  createdById: UUID;

  // TYPE
  @Column({ name: "type", type: "enum", nullable: false, enum: PaymentType })
  type: PaymentType;

  // STATUS
  @Column({ name: "status", type: "varchar", nullable: false })
  status: string;

  // DESCRIPTION
  @Column({ name: "description", type: "text", nullable: true })
  description: string;

  // PAYMENT METHOD
  @Column({ name: "method", type: "varchar", nullable: false })
  method: string;

  /**
   * RELATIONS
   */

  // CREATED BY
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "created_by_id" })
  createdBy: User;
}
