import { Injectable } from '@nestjs/common';
import { ReactionRepository } from '@/modules/reactions/infrastructure/repository/reaction.repository';
import { CreateReactionDto } from '@/modules/reactions/presentation/dtos/create-reaction.dto';
import { ReactionOrmEntity } from '@/modules/reactions/infrastructure/orm/reaction.entity.orm';

@Injectable()
export class CreateReactionUseCase {
  constructor(private readonly reactionRepository: ReactionRepository) {}

  async execute(createReactionDto: CreateReactionDto, userUuid: string) {
    const reaction = new ReactionOrmEntity();
    if (createReactionDto.contentType === 'post') {
      reaction.postUuid = createReactionDto.contentUuid;
    } else {
      reaction.commentUuid = createReactionDto.contentUuid;
    }
    reaction.userUuid = userUuid;
    return this.reactionRepository.create(reaction);
  }
}
