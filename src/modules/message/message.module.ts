import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageOrmEntity } from './infrastructure/orm/message.entity.orm';
import { ConversationOrmEntity } from './infrastructure/orm/conversation.entity.orm';
import { UserConversation } from './infrastructure/orm/user-conversation.entity.orm';
import { MessageController } from './presentation/controllers/message.controller';
import { SocketModule } from '../socket/socket.module';
import { MessageRepository } from './infrastructure/repositories/message.repository';
import { ConversationRepository } from './infrastructure/repositories/conversation.repository';
import { UserConversationRepository } from './infrastructure/repositories/user-conversation.repository';
import { StorageModule } from '../storage/storage.module';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { CreateConversationUseCase } from './application/use-cases/create-conversation.use-case';
import { CreateUserConversationUseCase } from './application/use-cases/create-user-conversation.use-case';
import { FindUuidConversationUseCase } from './application/use-cases/find-uuid-conversation.use-case';
import { GetHistoryMessageOfConversationUseCase } from './application/use-cases/get-history-message-of-conversation.use-case';
import { MessageMapper } from './application/mapper/message.mapper';
import { UsersModule } from '@/modules/users/users.module';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { GetConversationsUseCase } from './application/use-cases/get-conversations.use-case';
import { FindDetailUserByUuidConversationUseCase } from './application/use-cases/find-detail-user-by-uuid-conversation.use-case';
import { GetLastMessageAndLastTimeUseCase } from './application/use-cases/get-last-message-and-last-time.use-case';
import { GetConversationByUuidUseCase } from './application/use-cases/get-conversation-by-uuid.use-case';
import { SeenMessageRepository } from './infrastructure/repositories/seen-message.repository';
import { SeenMessageOrmEntity } from './infrastructure/orm/seen-message.entity.orm';
import { SeenMessageConversationUseCase } from '@/modules/message/application/use-cases/seen-message-conversation.use-case';
import { UpdateConversationUseCase } from './application/use-cases/update-conversation.use-case';
import { RemoveMemberFromConversationUseCase } from './application/use-cases/remove-member-from-conversation.use-case';
import { AddMemberIntoConversationUseCase } from './application/use-cases/add-member-into-conversation.use-case';
@Module({
  imports: [
    TypeOrmModule.forFeature([MessageOrmEntity, ConversationOrmEntity, UserConversation, SeenMessageOrmEntity]),
    SocketModule,
    StorageModule,
    UsersModule,
  ],
  controllers: [MessageController],
  providers: [
    MessageRepository,
    ConversationRepository,
    UserConversationRepository,
    SeenMessageRepository,
    SendMessageUseCase,
    CreateConversationUseCase,
    CreateUserConversationUseCase,
    FindUuidConversationUseCase,
    GetHistoryMessageOfConversationUseCase,
    MessageMapper,
    UserMapper,
    GetConversationsUseCase,
    FindDetailUserByUuidConversationUseCase,
    GetLastMessageAndLastTimeUseCase,
    GetConversationByUuidUseCase,
    SeenMessageConversationUseCase,
    UpdateConversationUseCase,
    RemoveMemberFromConversationUseCase,
    AddMemberIntoConversationUseCase,
  ],
  exports: [SendMessageUseCase, FindUuidConversationUseCase, GetHistoryMessageOfConversationUseCase],
})
export class MessageModule {}
