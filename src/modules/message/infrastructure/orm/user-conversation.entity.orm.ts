import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ConversationOrmEntity } from './conversation.entity.orm';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { BaseOrmEntity } from '@/shared/infrastructure/orm/base-orm.entity';

@Entity('user_conversation')
export class UserConversation extends BaseOrmEntity {
  @Column({ name: 'user_uuid' })
  userUuid: string;

  @Column({ name: 'conversation_uuid' })
  conversationUuid: string;

  @ManyToOne(() => UserOrmEntity, (user) => user.userConversations)
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user: UserOrmEntity;

  @ManyToOne(() => ConversationOrmEntity, (conversation) => conversation.participants)
  @JoinColumn({ name: 'conversation_uuid', referencedColumnName: 'uuid' })
  conversation: ConversationOrmEntity;
}
