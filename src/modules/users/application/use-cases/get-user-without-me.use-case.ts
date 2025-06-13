import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';

@Injectable()
export class GetUserWithoutMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, query: SearchOptions): Promise<PaginatedResult<UserOrmEntity>> {
    const users = await this.userRepository.getUserWithoutMe(userId, query);
    return users;
  }
}
