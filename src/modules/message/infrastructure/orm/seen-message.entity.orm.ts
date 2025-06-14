import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { MessageOrmEntity } from './message.entity.orm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

@Entity('seen_messages')
@Unique(['uuid', 'userUuid'])
export class SeenMessageOrmEntity extends BaseOrmEntity {
  @Column({ name: 'message_uuid' })
  messageUuid: string;

  @Column({ name: 'user_uuid' })
  userUuid: string;

  @ManyToOne(() => MessageOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_uuid', referencedColumnName: 'uuid' })
  message: MessageOrmEntity;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: UserOrmEntity;
}
