import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@/modules/users/domain/interfaces/user-repository.interface';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

@Injectable()
export class GetUserByUuidUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(uuid: string): Promise<UserOrmEntity> {
    const user = await this.userRepository.findByUuid(uuid);
    return user;
  }
}
