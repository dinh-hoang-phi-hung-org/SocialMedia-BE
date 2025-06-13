import { Entity, Column, OneToMany } from 'typeorm';
import { UserConversation } from './user-conversation.entity.orm';
import { MessageOrmEntity } from './message.entity.orm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';

@Entity('conversations')
export class ConversationOrmEntity extends BaseOrmEntity {
  @Column({ name: 'is_group_chat', default: false })
  isGroupChat: boolean;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  updatedAt: Date;

  @OneToMany(() => UserConversation, (uc) => uc.conversation)
  participants: UserConversation[];

  @OneToMany(() => MessageOrmEntity, (message) => message.conversation)
  messages: MessageOrmEntity[];

  @Column({ name: 'admin_uuid', nullable: true })
  adminUuid: string;

  @Column({ name: 'group_picture_url', nullable: true })
  groupPictureUrl: string;
}
