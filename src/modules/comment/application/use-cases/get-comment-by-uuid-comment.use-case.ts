import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../../infrastructure/repositories/comment.repository';
import { CommentOrmEntity } from '../../infrastructure/orm/comment.entity.orm';
@Injectable()
export class GetCommentByUuidCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(uuid: string): Promise<CommentOrmEntity> {
    const comment = await this.commentRepository.findByUuid(uuid);
    return comment;
  }
}
