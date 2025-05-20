import { Injectable } from '@nestjs/common';
import { CommentRepository } from '../../infrastructure/repositories/comment.repository';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { CommentOrmEntity } from '../../infrastructure/orm/comment.entity.orm';

@Injectable()
export class GetCommentByPostUuidUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(postUuid: string, query: SearchOptions): Promise<PaginatedResult<CommentOrmEntity>> {
    const comments = await this.commentRepository.findAllByPostUuid(postUuid, query);
    return comments;
  }
}
