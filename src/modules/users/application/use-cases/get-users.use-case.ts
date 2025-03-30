import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';

@Injectable()
export class GetUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(query: SearchOptions): Promise<PaginatedResult<UserOrmEntity>> {
    const users = await this.userRepository.findAll(query);
    return users;
  }
}
