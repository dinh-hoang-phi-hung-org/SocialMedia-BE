import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

@Entity('comments')
@Index(['postUuid'])
@Index(['userUuid'])
export class CommentOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  uuid: string;

  @Column({ name: 'post_uuid' })
  postUuid: string;

  @Column({ name: 'user_uuid' })
  userUuid: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'parent_uuid', type: 'varchar', nullable: true })
  parentUuid: string;

  @CreateDateColumn({ name: 'create_at' })
  createAt: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'media_url', type: 'json', nullable: true })
  mediaUrl: string;

  // Relations
  @ManyToOne(() => PostOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_uuid', referencedColumnName: 'uuid' })
  post: PostOrmEntity;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: UserOrmEntity;
}
