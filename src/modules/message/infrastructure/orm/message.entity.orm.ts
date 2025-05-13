import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ConversationOrmEntity } from './conversation.entity.orm';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';

@Entity('messages')
export class MessageOrmEntity extends BaseOrmEntity {
  @Index()
  @Column({ name: 'conversation_uuid' })
  conversationUuid: string;

  @Column({ name: 'sender_uuid' })
  senderUuid: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'media_url', type: 'json', nullable: true })
  mediaUrl: string;

  @ManyToOne(() => ConversationOrmEntity, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_uuid', referencedColumnName: 'uuid' })
  conversation: ConversationOrmEntity;

  @ManyToOne(() => UserOrmEntity, (user) => user.messages)
  @JoinColumn({ name: 'sender_uuid', referencedColumnName: 'uuid' })
  sender: UserOrmEntity;
}
