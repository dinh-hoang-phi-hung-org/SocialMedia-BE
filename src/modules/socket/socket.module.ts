import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { SocketGateway } from './socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallLogOrmEntity } from '@/modules/call/infrastructure/orm/call-log.entity.orm';
import { MessageOrmEntity } from '@/modules/message/infrastructure/orm/message.entity.orm';
import { ConversationOrmEntity } from '@/modules/message/infrastructure/orm/conversation.entity.orm';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([CallLogOrmEntity, MessageOrmEntity, ConversationOrmEntity, UserOrmEntity])],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
