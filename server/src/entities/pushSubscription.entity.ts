import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './index';
import { PushPlatform, PushReceiptStatus } from '../constants/push.constants';
import { User } from './user.entity';
import { UUID } from '../types';

@Entity('push_subscriptions')
export class PushSubscription extends AbstractEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: UUID;

  @Column({ name: 'expo_push_token', type: 'varchar', unique: true })
  expoPushToken: string;

  @Column({
    name: 'platform',
    type: 'enum',
    enum: PushPlatform,
    nullable: false,
  })
  platform: PushPlatform;

  @Column({ name: 'app_version', type: 'varchar', nullable: true })
  appVersion?: string;

  @Column({ name: 'device_name', type: 'varchar', nullable: true })
  deviceName?: string;

  @Column({ name: 'os_version', type: 'varchar', nullable: true })
  osVersion?: string;

  @Column({ name: 'notifications_enabled', type: 'boolean', default: true })
  notificationsEnabled: boolean;

  @Column({
    name: 'last_seen_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastSeenAt: Date;

  @Column({
    name: 'last_receipt_status',
    type: 'enum',
    enum: PushReceiptStatus,
    default: PushReceiptStatus.UNKNOWN,
  })
  lastReceiptStatus: PushReceiptStatus;

  @Column({ name: 'last_receipt_error', type: 'varchar', nullable: true })
  lastReceiptError?: string;

  @Column({ name: 'invalidated_at', type: 'timestamptz', nullable: true })
  invalidatedAt?: Date;

  @ManyToOne(() => User, (user) => user.pushSubscriptions, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
