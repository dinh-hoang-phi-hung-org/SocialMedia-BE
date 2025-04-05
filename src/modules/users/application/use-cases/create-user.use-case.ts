import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(createUserDto: UserOrmEntity): Promise<UserOrmEntity> {
    const user = await this.userRepository.create(createUserDto);
    return user;
  }
}
