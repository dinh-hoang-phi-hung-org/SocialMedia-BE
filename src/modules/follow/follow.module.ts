import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowController } from './presentation/controller/follow.controller';
import { FollowOrmEntity } from '@/modules/follow/infrastructure/orm/follow.entity.orm';
import { FollowUserUseCase } from '@/modules/follow/application/use-cases/follow-user.use-case';
import { FollowRepository } from '@/modules/follow/infrastructure/repositories/follow.repository';
import { GetFollowersListUseCase } from '@/modules/follow/application/use-cases/get-followers-list.use-case';
import { UnfollowUserUseCase } from '@/modules/follow/application/use-cases/unfollow-user.use-case';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { GetFollowingsListUseCase } from '@/modules/follow/application/use-cases/get-followings-list.use-case';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { AdjustUserFollowerCountUseCase } from '@/modules/follow/application/use-cases/adjust-user-follower-count.use-case';
import { AdjustUserFollowingCountUseCase } from '@/modules/follow/application/use-cases/adjust-user-following-count.use-case';
import { UsersModule } from '@/modules/users/users.module';
import { NotificationModule } from '@/modules/notification/notification.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([FollowOrmEntity, UserOrmEntity]),
    forwardRef(() => UsersModule),
    NotificationModule,
  ],
  controllers: [FollowController],
  providers: [
    FollowUserUseCase,
    FollowRepository,
    GetFollowersListUseCase,
    UnfollowUserUseCase,
    UserRepository,
    GetFollowingsListUseCase,
    UserMapper,
    AdjustUserFollowerCountUseCase,
    AdjustUserFollowingCountUseCase,
    {
      provide: 'IFollowRepository',
      useExisting: FollowRepository,
    },
  ],
  exports: [FollowRepository, TypeOrmModule.forFeature([FollowOrmEntity]), 'IFollowRepository'],
})
export class FollowModule {}
