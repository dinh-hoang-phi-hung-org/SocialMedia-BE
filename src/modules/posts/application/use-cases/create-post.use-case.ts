import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '@/modules/posts/domain/interfaces/post-repository.interface';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';

interface CreatePostParams {
  userUuid: string;
  content: string;
}

@Injectable()
export class CreatePostUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(params: CreatePostParams): Promise<PostOrmEntity> {
    const post = new PostOrmEntity();
    post.userUuid = params.userUuid;
    post.content = params.content;

    return this.postRepository.create(post);
  }
}
