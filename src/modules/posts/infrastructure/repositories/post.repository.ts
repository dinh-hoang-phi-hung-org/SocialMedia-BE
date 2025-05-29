import { Injectable, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '@/modules/posts/domain/interfaces/post-repository.interface';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { FindOptionsOrder, FindOptionsWhere, Repository, SortDirection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';

@Injectable()
export class PostRepository extends AbstractRepository<PostOrmEntity> implements IPostRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postRepository: Repository<PostOrmEntity>,
  ) {
    super({
      searchableFields: ['userUuid'],
      sortableFields: ['createdAt'],
    });
  }

  async findAllByUuidUser(uuid: string, query: SearchOptions): Promise<PaginatedResult<PostOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    let where: FindOptionsWhere<PostOrmEntity>[] = [{ userUuid: uuid, isHidden: false, isDeleted: false }];

    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
      where = where.map((w) => ({ ...w, isHidden: false, isDeleted: false, userUuid: uuid }));
    }

    let orderBy: FindOptionsOrder<PostOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }

    const skip = (page - 1) * limit;
    const [posts, total] = await this.postRepository.findAndCount({
      where: where,
      skip,
      take: limit,
      order: orderBy,
      relations: ['user'],
    });

    const lastPage = Math.ceil(total / limit);
    // console.log('posts', posts);
    return {
      data: posts,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async create(entity: PostOrmEntity): Promise<PostOrmEntity> {
    return this.postRepository.save(entity);
  }

  async findAll(query: SearchOptions): Promise<PaginatedResult<PostOrmEntity>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const [posts, total] = await this.postRepository.findAndCount({
      skip,
      take: limit,
    });

    const lastPage = Math.ceil(total / limit);
    return {
      data: posts,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findByUuid(uuid: string): Promise<PostOrmEntity> {
    const post = await this.postRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException('common:message.post_not_found');
    }
    return post;
  }

  async findById(id: number): Promise<PostOrmEntity> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(uuid: string, entity: PostOrmEntity): Promise<PostOrmEntity> {
    await this.findByUuid(uuid); // Verify post exists
    await this.postRepository.update({ uuid }, entity);
    return this.findByUuid(uuid); // This now loads the user relation
  }

  async delete(uuid: string): Promise<void> {
    const result = await this.postRepository.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Post with UUID ${uuid} not found`);
    }
  }

  async softDelete(uuid: string, field: string, value: any): Promise<void> {
    await this.findByUuid(uuid);
    await this.postRepository.update({ uuid }, { [field]: value });
  }
}
