import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/controller/users.controller';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UserOrmEntity } from './infrastructure/orm/users.entity.orm';
import { GetUserByUuidUseCase } from './application/use-cases/get-user-by-uuid.use-case';
import { UserMapper } from './application/mapper/user.mapper';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    UserMapper,
    GetUsersUseCase,
    GetUserByUuidUseCase,
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
