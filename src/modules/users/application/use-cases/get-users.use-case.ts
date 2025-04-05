import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';

@Injectable()
export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: SearchOptions): Promise<PaginatedResult<UserOrmEntity>> {
    const users = await this.userRepository.findAll(query);
    return users;
  }
}
