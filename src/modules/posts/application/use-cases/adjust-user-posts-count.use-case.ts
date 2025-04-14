import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '@/modules/users/domain/interfaces/user-repository.interface';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

@Injectable()
export class AdjustUserPostsCountUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userUuid: string, increase: boolean): Promise<UserOrmEntity> {
    const user = await this.userRepository.findByUuid(userUuid);
    user.posts_count += increase ? 1 : -1;
    return this.userRepository.update(userUuid, user);
  }
}
