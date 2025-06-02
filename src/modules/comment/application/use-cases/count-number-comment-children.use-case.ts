import { Injectable } from '@nestjs/common';

import { CommentRepository } from '../../infrastructure/repositories/comment.repository';

@Injectable()
export class CountNumberCommentChildrenUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(commentUuid: string): Promise<number> {
    const comments = await this.commentRepository.findByField('parentUuid', commentUuid);
    return comments.length;
  }
}
