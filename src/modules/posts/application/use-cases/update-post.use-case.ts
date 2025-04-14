import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '@/modules/posts/domain/interfaces/post-repository.interface';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';

interface UpdatePostParams {
  postUuid: string;
  content?: string | null;
  mediaUrl?: string | null;
}

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(params: UpdatePostParams): Promise<PostOrmEntity> {
    const post = await this.postRepository.findByUuid(params.postUuid);

    if (params.content) {
      post.content = params.content;
    }

    if (params.mediaUrl) {
      post.mediaUrl = params.mediaUrl;
    }

    return this.postRepository.update(post.uuid, post);
  }
}
