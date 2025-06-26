import { Inject, Injectable } from '@nestjs/common';
import { ISavePostRepository } from '@/modules/posts/domain/interfaces/save-post-repository.interface';
import { PostOrmEntity } from '../../infrastructure/orm/posts.entity.orm';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SavePostOrmEntity } from '../../infrastructure/orm/save-posts.entity.orm';

@Injectable()
export class GetSavedPostsUseCase {
  constructor(
    @Inject('ISavePostRepository')
    private readonly savePostRepository: ISavePostRepository,
  ) {}

  async execute(userUuid: string, options: SearchOptions): Promise<PaginatedResult<SavePostOrmEntity>> {
    const posts = await this.savePostRepository.getSavedPosts(userUuid, options);
    return posts;
  }
}
