import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationOrmEntity } from './infrastructure/orm/notification.entity.orm';
import { UserOrmEntity } from '../users/infrastructure/orm/users.entity.orm';
import { PostOrmEntity } from '../posts/infrastructure/orm/posts.entity.orm';

import { NotificationRepository } from './infrastructure/repository/notification.repository';
import { CreationNotificationUseCase } from './application/use-cases/creation-notification.use-case';
import { NotificationController } from './presentation/controller/notification.controller';
import { GetNotificationByUuidUserUseCase } from './application/use-cases/get-notification-by-uuid-user.use-case';
import { SocketModule } from '../socket/socket.module';
import { UserRepository } from '../users/infrastructure/repositories/user.repository';
import { PostRepository } from '../posts/infrastructure/repositories/post.repository';
import { NotificationMapper } from './application/mapper/notification.mapper';
import { ReadNotificationUseCase } from './application/use-cases/read-notification.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationOrmEntity, UserOrmEntity, PostOrmEntity]), SocketModule],
  controllers: [NotificationController],
  providers: [
    NotificationRepository,
    UserRepository,
    PostRepository,
    CreationNotificationUseCase,
    GetNotificationByUuidUserUseCase,
    NotificationMapper,
    ReadNotificationUseCase,
    {
      provide: 'NotificationRepository',
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationRepository, CreationNotificationUseCase],
})
export class NotificationModule {}
