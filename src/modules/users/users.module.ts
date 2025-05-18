import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/controller/users.controller';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UserOrmEntity } from './infrastructure/orm/users.entity.orm';
import { GetUserByUuidUseCase } from './application/use-cases/get-user-by-uuid.use-case';
import { UserMapper } from './application/mapper/user.mapper';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { FollowModule } from '@/modules/follow/follow.module';
import { FollowOrmEntity } from '@/modules/follow/infrastructure/orm/follow.entity.orm';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, FollowOrmEntity]), forwardRef(() => FollowModule)],
  controllers: [UsersController],
  providers: [
    UserMapper,
    GetUsersUseCase,
    GetUserByUuidUseCase,
    GetMeUseCase,
    UserRepository,
    JwtAuthGuard,
    {
      provide: 'IUserRepository',
      useExisting: UserRepository,
    },
  ],
  exports: [UserRepository, TypeOrmModule.forFeature([UserOrmEntity]), 'IUserRepository'],
})
export class UsersModule {}
