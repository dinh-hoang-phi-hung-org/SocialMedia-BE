import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import { CommentOrmEntity } from '@/modules/comment/infrastructure/orm/comment.entity.orm';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('reactions')
export class ReactionOrmEntity extends BaseOrmEntity {
  @Column({ name: 'user_uuid' })
  userUuid: string;

  @Column({ name: 'post_uuid', nullable: true })
  postUuid: string | null;

  @Column({ name: 'comment_uuid', nullable: true })
  commentUuid: string | null;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: UserOrmEntity;

  @ManyToOne(() => PostOrmEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'post_uuid', referencedColumnName: 'uuid' })
  post?: PostOrmEntity;

  @ManyToOne(() => CommentOrmEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'comment_uuid', referencedColumnName: 'uuid' })
  comment?: CommentOrmEntity;
}
