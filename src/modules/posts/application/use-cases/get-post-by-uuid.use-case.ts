import { Injectable } from '@nestjs/common';
import { PostRepository } from '../../infrastructure/repositories/post.repository';
import { PostOrmEntity } from '../../infrastructure/orm/posts.entity.orm';

@Injectable()
export class GetPostByUuidUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(uuid: string): Promise<PostOrmEntity> {
    return this.postRepository.findByUuid(uuid);
  }
}
