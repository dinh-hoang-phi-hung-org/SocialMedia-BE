import { Module } from '@nestjs/common';
import { CallService } from '@/modules/call/application/call.service';
import { CallController } from '@/modules/call/presentation/controller/call.controller';
import { RedisModule } from '@/modules/redis/redis.module';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { JwtStrategy } from '@/shared/strategies/jwt.strategy';

@Module({
  imports: [RedisModule],
  controllers: [CallController],
  providers: [CallService, JwtAuthGuard, JwtStrategy],
})
export class CallModule {}
