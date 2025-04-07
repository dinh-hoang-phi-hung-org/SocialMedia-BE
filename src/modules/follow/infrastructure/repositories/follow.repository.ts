import { Injectable, NotFoundException } from '@nestjs/common';
import { IFollowRepository } from '@/modules/follow/domain/interfaces/follow-repository.interface';
import { FollowOrmEntity } from '@/modules/follow/infrastructure/orm/follow.entity.orm';
import { FindOptionsOrder, FindOptionsWhere, Repository, SortDirection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';

@Injectable()
export class FollowRepository extends AbstractRepository<FollowOrmEntity> implements IFollowRepository {
  constructor(
    @InjectRepository(FollowOrmEntity)
    private readonly followRepository: Repository<FollowOrmEntity>,
  ) {
    super({
      searchableFields: ['follower_uuid', 'following_uuid'],
      sortableFields: ['createdAt'],
    });
  }
  async findByFollowerUuid(followingUuid: string, query: SearchOptions): Promise<PaginatedResult<FollowOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    let where: FindOptionsWhere<FollowOrmEntity>[] = [{ following_uuid: followingUuid }];

    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
      // Add following_uuid condition to each where clause
      where = where.map((w) => ({ ...w, following_uuid: followingUuid }));
    }

    let orderBy: FindOptionsOrder<FollowOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }

    const skip = (page - 1) * limit;
    const [users, total] = await this.followRepository.findAndCount({
      where: where,
      skip,
      take: limit,
      order: orderBy,
      relations: ['follower'], // Add this to get follower user details
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

  async findByFollowingUuid(followerUuid: string, query: SearchOptions): Promise<PaginatedResult<FollowOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    let where: FindOptionsWhere<FollowOrmEntity>[] = [{ follower_uuid: followerUuid }];

    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
      // Add following_uuid condition to each where clause
      where = where.map((w) => ({ ...w, follower_uuid: followerUuid }));
    }

    let orderBy: FindOptionsOrder<FollowOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }

    const skip = (page - 1) * limit;
    const [users, total] = await this.followRepository.findAndCount({
      where: where,
      skip,
      take: limit,
      order: orderBy,
      relations: ['following'], // Add this to get follower user details
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

  async findByFollowerUuidAndFollowingUuid(
    followerUuid: string,
    followingUuid: string,
  ): Promise<FollowOrmEntity | null> {
    const follow = await this.followRepository.findOne({
      where: {
        follower_uuid: followerUuid,
        following_uuid: followingUuid,
      },
    });
    return follow;
  }

  async create(entity: FollowOrmEntity): Promise<FollowOrmEntity> {
    return this.followRepository.save(entity);
  }
  findAll(query: SearchOptions): Promise<PaginatedResult<FollowOrmEntity>> {
    return this.findAll(query);
  }
  findByUuid(uuid: string): Promise<FollowOrmEntity> {
    return this.findByUuid(uuid);
  }
  findById(id: number): Promise<FollowOrmEntity> {
    return this.findById(id);
  }
  update(uuid: string, entity: FollowOrmEntity): Promise<FollowOrmEntity> {
    return this.update(uuid, entity);
  }

  async delete(uuid: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { uuid },
    });
    if (!follow) {
      throw new NotFoundException(`Follow with UUID ${uuid} not found`);
    }
    await this.followRepository.delete({ uuid });
  }
}
