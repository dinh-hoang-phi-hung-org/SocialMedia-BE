import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './presentation/controller/users.controller';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UserOrmEntity } from './infrastructure/orm/users.entity.orm';
import { GetUserByUuidUseCase } from './application/use-cases/get-user-by-uuid.use-case';
import { UserMapper } from './application/mapper/user.mapper';
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    UserMapper,
    GetUsersUseCase,
    GetUserByUuidUseCase,
    UserRepository,
    {
      provide: 'IUserRepository',
      useExisting: UserRepository,
    },
  ],
})
export class UsersModule {}
