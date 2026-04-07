import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserStatus } from '../constants/user.constants';
import { AbstractEntity } from './index';
import { User } from './user.entity';
import { UUID } from '../types';

@Entity('user_status_proofs')
export class UserStatusProof extends AbstractEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: UUID;

  @ManyToOne(() => User, (user) => user.statusProofs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'image_url', type: 'varchar', length: 1024 })
  imageUrl: string;

  @Column({ name: 'status', type: 'enum', enum: UserStatus })
  status: UserStatus;

  @Column({ name: 'captured_at', type: 'timestamptz' })
  capturedAt: Date;

  @Column({ name: 'location_label', type: 'varchar', length: 255, nullable: true })
  locationLabel?: string;

  @Column({ name: 'latitude', type: 'double precision', nullable: true })
  latitude?: number;

  @Column({ name: 'longitude', type: 'double precision', nullable: true })
  longitude?: number;

  @Column({ name: 'overlay_applied', type: 'boolean', default: false })
  overlayApplied: boolean;

  @Column({ name: 'overlay_version', type: 'varchar', length: 32, nullable: true })
  overlayVersion?: string;

  @Column({ name: 'overlay_source', type: 'varchar', length: 64, nullable: true })
  overlaySource?: string;
}
