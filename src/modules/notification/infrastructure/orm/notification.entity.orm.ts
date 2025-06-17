import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('notifications')
export class NotificationOrmEntity extends BaseOrmEntity {
  @Column({ name: 'user_uuid' })
  userUuid: string;

  @Column({ type: 'varchar' })
  type: string; // e.g., 'friend_request', 'post_reaction', etc.

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'related_uuid', type: 'varchar', nullable: true })
  relatedUuid: string | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'user_related_uuid', type: 'varchar', nullable: true })
  userRelatedUuid: string | null;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: UserOrmEntity;
}
