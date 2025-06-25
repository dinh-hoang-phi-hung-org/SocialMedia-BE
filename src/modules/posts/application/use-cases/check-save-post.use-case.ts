import { Injectable, Inject } from '@nestjs/common';
import { ISavePostRepository } from '@/modules/posts/domain/interfaces/save-post-repository.interface';

@Injectable()
export class CheckSavePostUseCase {
  constructor(
    @Inject('ISavePostRepository')
    private readonly savePostRepository: ISavePostRepository,
  ) {}
  async execute(postUuid: string, userUuid: string): Promise<boolean> {
    const savePostUuid = await this.savePostRepository.isPostSaved(postUuid, userUuid);
    return savePostUuid ? true : false;
  }
}
