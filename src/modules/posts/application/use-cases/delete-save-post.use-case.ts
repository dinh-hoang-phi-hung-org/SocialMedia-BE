import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ISavePostRepository } from '@/modules/posts/domain/interfaces/save-post-repository.interface';

@Injectable()
export class DeleteSavePostUseCase {
  constructor(
    @Inject('ISavePostRepository')
    private readonly savePostRepository: ISavePostRepository,
  ) {}
  async execute(postUuid: string, userUuid: string): Promise<void> {
    const savePostUuid = await this.savePostRepository.isPostSaved(postUuid, userUuid);
    if (savePostUuid) {
      await this.savePostRepository.delete(savePostUuid);
    } else {
      throw new NotFoundException('Post not saved');
    }
  }
}
