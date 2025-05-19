import { Injectable, Inject } from '@nestjs/common';
import { ICommentRepository } from '@/modules/comment/domain/interfaces/comment-repository.interface';
import { CommentOrmEntity } from '@/modules/comment/infrastructure/orm/comment.entity.orm';

interface UpdateCommentParams {
  commentUuid: string;
  content?: string | null;
  mediaUrl?: string | null;
}

@Injectable()
export class UpdateCommentToCreateUseCase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(params: UpdateCommentParams): Promise<CommentOrmEntity> {
    const comment = await this.commentRepository.findByUuid(params.commentUuid);

    if (params.content) {
      comment.content = params.content;
    }

    if (params.mediaUrl) {
      comment.mediaUrl = params.mediaUrl;
    }

    return this.commentRepository.update(comment.uuid, comment);
  }
}
