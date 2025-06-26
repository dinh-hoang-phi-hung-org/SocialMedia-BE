import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import { PostOrmEntity } from './posts.entity.orm';

@Entity('save_posts')
@Index(['userUuid'])
export class SavePostOrmEntity extends BaseOrmEntity {
  @Column({ name: 'user_uuid' })
  userUuid: string;

  @Column({ name: 'post_uuid' })
  postUuid: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: UserOrmEntity;

  @ManyToOne(() => PostOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_uuid', referencedColumnName: 'uuid' })
  post: PostOrmEntity;
}
