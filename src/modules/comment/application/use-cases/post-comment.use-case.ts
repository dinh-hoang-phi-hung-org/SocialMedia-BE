import { Injectable, Inject } from '@nestjs/common';
import { ICommentRepository } from '../../domain/interfaces/comment-repository.interface';
import { CommentOrmEntity } from '../../infrastructure/orm/comment.entity.orm';

@Injectable()
export class PostCommentUseCase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(postUuid: string, userUuid: string, content: string, parentUuid?: string): Promise<CommentOrmEntity> {
    const newComment = new CommentOrmEntity();
    newComment.postUuid = postUuid;
    newComment.userUuid = userUuid;
    newComment.content = content;
    newComment.createAt = new Date();
    if (parentUuid) {
      newComment.parentUuid = parentUuid;
    }
    const comment = await this.commentRepository.create(newComment);
    const commentResponse = this.commentRepository.findByUuid(comment.uuid);
    return commentResponse;
  }
}
