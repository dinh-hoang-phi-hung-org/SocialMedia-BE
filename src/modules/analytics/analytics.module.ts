import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { ReportOrmEntity } from '@/modules/report/infrastructure/orm/report.entity.orm';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, PostOrmEntity, ReportOrmEntity])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
