import { PostRepository } from '@/modules/posts/infrastructure/repositories/post.repository';
import { Injectable } from '@nestjs/common';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';

@Injectable()
export class GetPostsByUuidUserUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(uuid: string, query: SearchOptions): Promise<PaginatedResult<PostOrmEntity>> {
    const posts = await this.postRepository.findAllByUuidUser(uuid, query);
    return posts;
  }
}
