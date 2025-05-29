import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';

@Entity('posts')
@Index(['userUuid'])
export class PostOrmEntity extends BaseOrmEntity {
  @Column({ name: 'user_uuid' })
  userUuid: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'media_url', type: 'json', nullable: true })
  mediaUrl: string;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: UserOrmEntity;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;
}
