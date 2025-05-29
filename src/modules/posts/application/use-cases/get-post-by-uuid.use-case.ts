import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../../infrastructure/repositories/post.repository';
import { PostOrmEntity } from '../../infrastructure/orm/posts.entity.orm';

@Injectable()
export class GetPostByUuidUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(uuid: string, isAdmin: boolean = false): Promise<PostOrmEntity> {
    const post = await this.postRepository.findByUuid(uuid);

    if (!post) {
      throw new NotFoundException('common:message.post_not_found');
    }

    if (!isAdmin && post.isDeleted) {
      throw new NotFoundException('common:message.post_not_found');
    }

    return post;
  }
}
