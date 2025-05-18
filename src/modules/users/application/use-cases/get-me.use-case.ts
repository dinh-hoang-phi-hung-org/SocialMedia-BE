import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { IUserRepository } from '@/modules/users/domain/interfaces/user-repository.interface';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(uuid: string): Promise<UserOrmEntity> {
    console.log('uuid', uuid);
    const user = await this.userRepository.findByUuid(uuid);
    return user;
  }
}
