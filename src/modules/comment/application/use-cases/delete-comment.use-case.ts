import { Injectable, Inject } from '@nestjs/common';
import { ICommentRepository } from '@/modules/comment/domain/interfaces/comment-repository.interface';

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(commentUuid: string): Promise<void> {
    console.log('commentUuid', commentUuid);
    await this.commentRepository.delete(commentUuid);
  }
}
