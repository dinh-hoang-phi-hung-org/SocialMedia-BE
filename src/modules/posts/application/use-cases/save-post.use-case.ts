import { Injectable, Inject } from '@nestjs/common';
import { ISavePostRepository } from '@/modules/posts/domain/interfaces/save-post-repository.interface';
import { SavePostOrmEntity } from '../../infrastructure/orm/save-posts.entity.orm';

@Injectable()
export class SavePostUseCase {
  constructor(
    @Inject('ISavePostRepository')
    private readonly savePostRepository: ISavePostRepository,
  ) {}
  async execute(postUuid: string, userUuid: string): Promise<void> {
    const savePostOrmEntity = new SavePostOrmEntity();
    savePostOrmEntity.postUuid = postUuid;
    savePostOrmEntity.userUuid = userUuid;
    await this.savePostRepository.create(savePostOrmEntity);
  }
}
