import { Module } from '@nestjs/common';
import { ReactionController } from './presentation/controller/reaction.controller';
import { ReactionRepository } from './infrastructure/repository/reaction.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionOrmEntity } from './infrastructure/orm/reaction.entity.orm';
import { CreateReactionUseCase } from './application/usecases/create-reaction.use-case';
import { CheckIsReactedUseCase } from './application/usecases/check-is-react.use-case';
import { DeleteReactionUseCase } from './application/usecases/delete-reaction.use-case';
import { NotificationModule } from '@/modules/notification/notification.module';
import { PostRepository } from '@/modules/posts/infrastructure/repositories/post.repository';
import { CommentRepository } from '@/modules/comment/infrastructure/repositories/comment.repository';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { CommentOrmEntity } from '@/modules/comment/infrastructure/orm/comment.entity.orm';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionOrmEntity, PostOrmEntity, CommentOrmEntity]), NotificationModule],
  controllers: [ReactionController],
  providers: [
    ReactionRepository,
    PostRepository,
    CommentRepository,
    CreateReactionUseCase,
    CheckIsReactedUseCase,
    DeleteReactionUseCase,
    {
      provide: 'IReactionRepository',
      useExisting: ReactionRepository,
    },
  ],
  exports: [ReactionRepository, TypeOrmModule.forFeature([ReactionOrmEntity]), 'IReactionRepository'],
})
export class ReactionsModule {}
