import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './index';
import { User } from './user.entity';
import { UUID } from '../types';

@Entity('user_problem_reports')
export class UserProblemReport extends AbstractEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: UUID;

  @ManyToOne(() => User, (user) => user.problemReports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'image_url', type: 'varchar', length: 1024 })
  imageUrl: string;

  @Column({ name: 'media_type', type: 'varchar', length: 16, default: 'photo' })
  mediaType: 'photo' | 'video';

  @Column({ name: 'submission_type', type: 'varchar', length: 16, default: 'PROBLEM' })
  submissionType: 'PROBLEM' | 'RECEIPT';

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'captured_at', type: 'timestamptz' })
  capturedAt: Date;

  @Column({ name: 'location_label', type: 'varchar', length: 255, nullable: true })
  locationLabel?: string;

  @Column({ name: 'source', type: 'varchar', length: 128, nullable: true })
  source?: string;

  @Column({ name: 'overlay_applied', type: 'boolean', default: false })
  overlayApplied: boolean;

  @Column({ name: 'overlay_version', type: 'varchar', length: 32, nullable: true })
  overlayVersion?: string;

  @Column({ name: 'overlay_source', type: 'varchar', length: 64, nullable: true })
  overlaySource?: string;
}
