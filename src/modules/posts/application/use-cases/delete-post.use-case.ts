import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '@/modules/posts/domain/interfaces/post-repository.interface';

@Injectable()
export class DeletePostUseCase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(postUuid: string): Promise<void> {
    await this.postRepository.softDelete(postUuid, 'isDeleted', true);
  }
}
