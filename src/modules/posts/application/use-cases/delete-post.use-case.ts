import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '@/modules/posts/domain/interfaces/post-repository.interface';

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(postUuid: string): Promise<void> {
    console.log('postUuid', postUuid);
    await this.postRepository.delete(postUuid);
  }
}
