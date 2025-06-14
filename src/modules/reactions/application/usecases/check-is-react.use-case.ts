import { Injectable } from '@nestjs/common';
import { ReactionRepository } from '@/modules/reactions/infrastructure/repository/reaction.repository';

@Injectable()
export class CheckIsReactedUseCase {
  constructor(private readonly reactionRepository: ReactionRepository) {}

  async execute(contentUuid: string, userUuid: string, contentType: 'post' | 'comment') {
    return this.reactionRepository.checkIsReacted(contentUuid, userUuid, contentType);
  }
}
