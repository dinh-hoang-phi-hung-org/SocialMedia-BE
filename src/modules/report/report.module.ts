import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportOrmEntity } from './infrastructure/orm/report.entity.orm';
import { ReportRepository } from './infrastructure/repositories/report.repository';
import { CreateReportUseCase } from './application/use-cases/create-report.use-case';
import { ReportController } from './presentation/controller/report.controller';
import { GetAllReportUseCase } from './application/use-cases/get-all-report.use-case';
import { ReportMapper } from './application/mapper/report.mapper';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { UsersModule } from '../users/users.module';
import { GetAllReportWithTypeUseCase } from './application/use-cases/get-all-report-type.use-case';
import { GetReportByUuidTypePostUseCase } from './application/use-cases/get-report-by-uuid-type-post';
import { GetReportByUuidTypeCommentUseCase } from './application/use-cases/get-report-by-uuid-type-comment';
import { CommentMapper } from '@/modules/comment/application/mapper/comment.mapper';
import { CommentModule } from '@/modules/comment/comment.module';
import { PostMapper } from '@/modules/posts/application/mapper/post.mapper';
import { PostsModule } from '@/modules/posts/posts.module';
import { PostRepository } from '@/modules/posts/infrastructure/repositories/post.repository';
import { CommentRepository } from '@/modules/comment/infrastructure/repositories/comment.repository';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { CommentOrmEntity } from '@/modules/comment/infrastructure/orm/comment.entity.orm';
import { UpdateStatusOfReportUseCase } from './application/use-cases/update-status-of-report.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportOrmEntity, PostOrmEntity, CommentOrmEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => CommentModule),
    forwardRef(() => PostsModule),
  ],
  controllers: [ReportController],
  providers: [
    ReportRepository,
    PostRepository,
    CommentRepository,
    CreateReportUseCase,
    GetAllReportUseCase,
    GetAllReportWithTypeUseCase,
    GetReportByUuidTypePostUseCase,
    GetReportByUuidTypeCommentUseCase,
    UpdateStatusOfReportUseCase,
    ReportMapper,
    CommentMapper,
    PostMapper,
    UserMapper,
    {
      provide: 'IReportRepository',
      useExisting: ReportRepository,
    },
    {
      provide: 'IPostRepository',
      useExisting: PostRepository,
    },
    {
      provide: 'ICommentRepository',
      useExisting: CommentRepository,
    },
  ],
})
export class ReportModule {}
