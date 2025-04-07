import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('follow')
export class FollowOrmEntity extends BaseOrmEntity {
  @Column()
  @Index()
  follower_uuid: string;

  @Column()
  @Index()
  following_uuid: string;

  @ManyToOne(() => UserOrmEntity, (user) => user.followings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_uuid', referencedColumnName: 'uuid' })
  follower: UserOrmEntity;

  @ManyToOne(() => UserOrmEntity, (user) => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_uuid', referencedColumnName: 'uuid' })
  following: UserOrmEntity;
}
