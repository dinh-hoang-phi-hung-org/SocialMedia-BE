import { Module } from '@nestjs/common';
import { UsersController } from './presentation/controller/users.controller';

@Module({
  controllers: [UsersController],
})
export class UsersModule {}
