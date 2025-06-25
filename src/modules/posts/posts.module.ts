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
import { GetHomeFeedUseCase } from '@/modules/posts/application/use-cases/get-home-feed.use-case';
import { FollowModule } from '@/modules/follow/follow.module';
import { SavePostOrmEntity } from '@/modules/posts/infrastructure/orm/save-posts.entity.orm';
import { SavePostRepository } from '@/modules/posts/infrastructure/repositories/save-post.repository';
import { SavePostUseCase } from '@/modules/posts/application/use-cases/save-post.use-case';
import { DeleteSavePostUseCase } from '@/modules/posts/application/use-cases/delete-save-post.use-case';
import { CheckSavePostUseCase } from '@/modules/posts/application/use-cases/check-save-post.use-case';
import { GetSavedPostsUseCase } from '@/modules/posts/application/use-cases/get-saved-posts.use-case';
@Module({
  imports: [
    TypeOrmModule.forFeature([PostOrmEntity, SavePostOrmEntity]),
    StorageModule,
    UsersModule,
    CommentModule,
    FollowModule,
    ReactionsModule,
  ],
  controllers: [PostsController],
  providers: [
    PostRepository,
    SavePostRepository,
    JwtAuthGuard,
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    AdjustUserPostsCountUseCase,
    GetPostsByUuidUserUseCase,
    PostMapper,
    UserMapper,
    GetPostByUuidUseCase,
    GetHomeFeedUseCase,
    SavePostUseCase,
    DeleteSavePostUseCase,
    CheckSavePostUseCase,
    GetSavedPostsUseCase,
    {
      provide: 'IPostRepository',
      useExisting: PostRepository,
    },
    {
      provide: 'ISavePostRepository',
      useExisting: SavePostRepository,
    },
  ],
})
export class PostsModule {}
