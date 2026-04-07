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

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'captured_at', type: 'timestamptz' })
  capturedAt: Date;

  @Column({ name: 'location_label', type: 'varchar', length: 255, nullable: true })
  locationLabel?: string;

  @Column({ name: 'source', type: 'varchar', length: 128, nullable: true })
  source?: string;
}
