import { forwardRef, Module } from '@nestjs/common';
import { CommentController } from './presentation/controller/comment.controller';
import { PostCommentUseCase } from './application/use-cases/post-comment.use-case';
import { CommentRepository } from './infrastructure/repositories/comment.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentOrmEntity } from './infrastructure/orm/comment.entity.orm';
import { GetCommentByPostUuidUseCase } from './application/use-cases/get-comment-by-post-uuid.use-case';
import { CommentMapper } from './application/mapper/comment.mapper';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { GetCommentByPostUuidAndParentUuidUseCase } from './application/use-cases/get-comment-by-post-uuid-and-parent-uuid.use-case';
import { StorageModule } from '@/modules/storage/storage.module';
import { UpdateCommentToCreateUseCase } from '@/modules/comment/application/use-cases/update-comment-to-create.use-case';
import { DeleteCommentUseCase } from '@/modules/comment/application/use-cases/delete-comment.use-case';
import { PostMapper } from '@/modules/posts/application/mapper/post.mapper';
import { PostsModule } from '../posts/posts.module';
import { GetCommentByUuidCommentUseCase } from './application/use-cases/get-comment-by-uuid-comment.use-case';
import { CountNumberCommentChildrenUseCase } from './application/use-cases/count-number-comment-children.use-case';
import { ReactionsModule } from '@/modules/reactions/reactions.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([CommentOrmEntity]),
    StorageModule,
    forwardRef(() => PostsModule),
    ReactionsModule,
  ],
  controllers: [CommentController],
  providers: [
    PostCommentUseCase,
    CommentRepository,
    GetCommentByPostUuidUseCase,
    GetCommentByPostUuidAndParentUuidUseCase,
    CommentMapper,
    UserMapper,
    PostMapper,
    DeleteCommentUseCase,
    UpdateCommentToCreateUseCase,
    GetCommentByUuidCommentUseCase,
    CountNumberCommentChildrenUseCase,
    {
      provide: 'ICommentRepository',
      useExisting: CommentRepository,
    },
  ],
  exports: [CommentRepository, TypeOrmModule.forFeature([CommentOrmEntity]), 'ICommentRepository', CommentMapper],
})
export class CommentModule {}
