import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { IUserRepository } from '@/modules/users/domain/interfaces/user-repository.interface';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { IFollowRepository } from '@/modules/follow/domain/interfaces/follow-repository.interface';
@Injectable()
export class GetUserByUuidUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject(forwardRef(() => 'IFollowRepository'))
    private readonly followRepository: IFollowRepository,
  ) {}

  async execute(uuid: string, currentUserUuid: string): Promise<UserOrmEntity & { isFollowed: boolean }> {
    const user = await this.userRepository.findByUuid(uuid);
    const isFollowed = await this.followRepository.findByFollowerUuidAndFollowingUuid(uuid, currentUserUuid);
    return { ...user, isFollowed: isFollowed ? true : false };
  }
}
