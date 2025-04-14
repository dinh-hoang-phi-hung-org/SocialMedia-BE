import { Entity, Column, OneToMany } from 'typeorm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import { UserRole } from '@/shared/enum/role';
import { Gender } from '@/shared/enum/gender';
import { FollowOrmEntity } from '@/modules/follow/infrastructure/orm/follow.entity.orm';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';

@Entity('users')
export class UserOrmEntity extends BaseOrmEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  profile_picture_url: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  followers_count: number;

  @Column({ default: 0 })
  followings_count: number;

  @Column({ default: 0 })
  posts_count: number;

  // Users that this user is following
  @OneToMany(() => FollowOrmEntity, (follow) => follow.follower)
  followings: FollowOrmEntity[];

  // Users that are following this user
  @OneToMany(() => FollowOrmEntity, (follow) => follow.following)
  followers: FollowOrmEntity[];

  @OneToMany(() => PostOrmEntity, (post) => post.user)
  posts: PostOrmEntity[];
}
