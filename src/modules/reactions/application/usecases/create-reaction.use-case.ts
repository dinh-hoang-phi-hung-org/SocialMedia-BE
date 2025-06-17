import { Injectable } from '@nestjs/common';
import { ReactionRepository } from '@/modules/reactions/infrastructure/repository/reaction.repository';
import { CreateReactionDto } from '@/modules/reactions/presentation/dtos/create-reaction.dto';
import { ReactionOrmEntity } from '@/modules/reactions/infrastructure/orm/reaction.entity.orm';
import { CreationNotificationUseCase } from '@/modules/notification/application/use-cases/creation-notification.use-case';
import { PostRepository } from '@/modules/posts/infrastructure/repositories/post.repository';
import { CommentRepository } from '@/modules/comment/infrastructure/repositories/comment.repository';

@Injectable()
export class CreateReactionUseCase {
  constructor(
    private readonly reactionRepository: ReactionRepository,
    private readonly creationNotificationUseCase: CreationNotificationUseCase,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(createReactionDto: CreateReactionDto, userUuid: string) {
    const reaction = new ReactionOrmEntity();

    let contentOwnerUuid: string;
    let notificationContent: string;

    if (createReactionDto.contentType === 'post') {
      reaction.postUuid = createReactionDto.contentUuid;

      const post = await this.postRepository.findByUuid(createReactionDto.contentUuid);
      contentOwnerUuid = post.userUuid;
      notificationContent = 'notification:message.reaction-post';
    } else {
      reaction.commentUuid = createReactionDto.contentUuid;

      const comment = await this.commentRepository.findByUuid(createReactionDto.contentUuid);
      contentOwnerUuid = comment.userUuid;
      notificationContent = 'notification:message.reaction-comment';
    }

    reaction.userUuid = userUuid;
    const createdReaction = await this.reactionRepository.create(reaction);

    if (contentOwnerUuid !== userUuid) {
      await this.creationNotificationUseCase.execute(
        contentOwnerUuid,
        'reaction',
        notificationContent,
        createReactionDto.contentUuid,
        userUuid,
      );
    }

    return createdReaction;
  }
}
