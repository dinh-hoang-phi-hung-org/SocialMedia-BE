import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '@/modules/users/domain/interfaces/user-repository.interface';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsOrder, SortDirection, Not } from 'typeorm';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
import { UserRole } from '@/shared/enum/role';
@Injectable()
export class UserRepository extends AbstractRepository<UserOrmEntity> implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {
    super({
      searchableFields: ['username', 'email', 'first_name', 'last_name'],
      sortableFields: [
        'createdAt',
        'username',
        'email',
        'first_name',
        'last_name',
        'followers_count',
        'followings_count',
        'posts_count',
        'last_login',
      ],
    });
  }
  async getUserWithoutMe(userId: string, query: SearchOptions): Promise<PaginatedResult<UserOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    let where: FindOptionsWhere<UserOrmEntity>[] = [{ role: UserRole.USER, uuid: Not(userId) }];
    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
    }

    let orderBy: FindOptionsOrder<UserOrmEntity>;
    if (sortBy && sortBy != '') {
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }

    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepository.findAndCount({
      where: where,
      skip,
      take: limit,
      order: orderBy,
    });

    const lastPage = Math.ceil(total / limit);
    return {
      data: users,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async create(entity: UserOrmEntity): Promise<UserOrmEntity> {
    return await this.userRepository.save(entity);
  }

  async findAll(query: SearchOptions): Promise<PaginatedResult<UserOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    let where: FindOptionsWhere<UserOrmEntity>[] = [{ role: UserRole.USER }];
    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
      where = where.map((w) => ({ ...w, role: UserRole.USER }));
    }

    let orderBy: FindOptionsOrder<UserOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }

    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepository.findAndCount({
      where: where,
      skip,
      take: limit,
      order: orderBy,
    });

    const lastPage = Math.ceil(total / limit);
    return {
      data: users,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findByUuid(uuid: string): Promise<UserOrmEntity> {
    const user = await this.userRepository.findOne({
      where: { uuid },
    });

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserOrmEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return user;
  }

  async findByUsername(username: string): Promise<UserOrmEntity | null> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    return user;
  }

  async findById(id: number): Promise<UserOrmEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(uuid: string, entity: Partial<UserOrmEntity>): Promise<UserOrmEntity> {
    await this.findByUuid(uuid); // Verify user exists
    await this.userRepository.update({ uuid }, entity);
    return await this.findByUuid(uuid);
  }

  async delete(uuid: string): Promise<void> {
    await this.findByUuid(uuid); // Verify user exists
    await this.userRepository.delete({ uuid });
  }
}
