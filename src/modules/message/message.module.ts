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
@Module({
  imports: [
    TypeOrmModule.forFeature([MessageOrmEntity, ConversationOrmEntity, UserConversation]),
    SocketModule,
    StorageModule,
    UsersModule,
  ],
  controllers: [MessageController],
  providers: [
    MessageRepository,
    ConversationRepository,
    UserConversationRepository,
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
  ],
  exports: [SendMessageUseCase, FindUuidConversationUseCase, GetHistoryMessageOfConversationUseCase],
})
export class MessageModule {}
