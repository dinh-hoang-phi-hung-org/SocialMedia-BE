import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export type ReportContentType = 'post' | 'comment';
export type ReportStatus = 'pending' | 'banned' | 'closed';

@Entity('reports')
export class ReportOrmEntity extends BaseOrmEntity {
  @Column({ name: 'reporter_uuid' })
  reporterUuid: string;

  @Column({ name: 'content_type', type: 'varchar' })
  contentType: ReportContentType;

  @Column({ name: 'content_uuid', type: 'varchar' })
  contentUuid: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: ReportStatus;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_uuid', referencedColumnName: 'uuid' })
  reporter: UserOrmEntity;
}
