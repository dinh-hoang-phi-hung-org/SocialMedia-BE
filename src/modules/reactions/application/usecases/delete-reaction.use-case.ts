import { Injectable } from '@nestjs/common';
import { ReactionRepository } from '@/modules/reactions/infrastructure/repository/reaction.repository';
import { CreateReactionDto } from '@/modules/reactions/presentation/dtos/create-reaction.dto';

@Injectable()
export class DeleteReactionUseCase {
  constructor(private readonly reactionRepository: ReactionRepository) {}

  async execute(createReactionDto: CreateReactionDto, userUuid: string) {
    return this.reactionRepository.deleteByContentUuidAndUserUuid(
      createReactionDto.contentUuid,
      userUuid,
      createReactionDto.contentType,
    );
  }
}
