import { PostsController } from '@/modules/posts/presentation/controller/posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { Module } from '@nestjs/common';
import { PostRepository } from '@/modules/posts/infrastructure/repositories/post.repository';
import { CreatePostUseCase } from '@/modules/posts/application/use-cases/create-post.use-case';
import { StorageModule } from '@/modules/storage/storage.module';
import { UpdatePostUseCase } from '@/modules/posts/application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '@/modules/posts/application/use-cases/delete-post.use-case';
import { AdjustUserPostsCountUseCase } from '@/modules/posts/application/use-cases/adjust-user-posts-count.use-case';
import { UsersModule } from '@/modules/users/users.module';
import { GetPostsByUuidUserUseCase } from '@/modules/posts/application/use-cases/get-posts-by-uuid-user.use-case';
import { PostMapper } from '@/modules/posts/application/mapper/post.mapper';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { GetPostByUuidUseCase } from '@/modules/posts/application/use-cases/get-post-by-uuid.use-case';
import { CommentModule } from '@/modules/comment/comment.module';
import { ReactionsModule } from '@/modules/reactions/reactions.module';
@Module({
  imports: [TypeOrmModule.forFeature([PostOrmEntity]), StorageModule, UsersModule, CommentModule, ReactionsModule],
  controllers: [PostsController],
  providers: [
    PostRepository,
    JwtAuthGuard,
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    AdjustUserPostsCountUseCase,
    GetPostsByUuidUserUseCase,
    PostMapper,
    UserMapper,
    GetPostByUuidUseCase,
    {
      provide: 'IPostRepository',
      useExisting: PostRepository,
    },
  ],
})
export class PostsModule {}
