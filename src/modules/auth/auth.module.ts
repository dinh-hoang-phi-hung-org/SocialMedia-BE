import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controller/auth.controller';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
