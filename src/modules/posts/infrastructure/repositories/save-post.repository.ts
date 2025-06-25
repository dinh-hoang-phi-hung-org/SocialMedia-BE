import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsOrder, FindOptionsWhere, Repository, SortDirection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
import { SavePostOrmEntity } from '../orm/save-posts.entity.orm';
import { ISavePostRepository } from '@/modules/posts/domain/interfaces/save-post-repository.interface';

@Injectable()
export class SavePostRepository extends AbstractRepository<SavePostOrmEntity> implements ISavePostRepository {
  constructor(
    @InjectRepository(SavePostOrmEntity)
    private readonly savePostRepository: Repository<SavePostOrmEntity>,
  ) {
    super({
      searchableFields: ['userUuid', 'postUuid'],
      sortableFields: ['createdAt'],
    });
  }
  async isPostSaved(postUuid: string, userUuid: string): Promise<string | null> {
    const savePost = await this.savePostRepository.findOne({ where: { postUuid, userUuid } });
    return savePost?.uuid || null;
  }

  async getSavedPosts(userUuid: string, options: SearchOptions): Promise<PaginatedResult<SavePostOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = options;

    let where: FindOptionsWhere<SavePostOrmEntity>[] = [{ userUuid }];

    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
    }
    let orderBy: FindOptionsOrder<SavePostOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }
    const [data, total] = await this.savePostRepository.findAndCount({
      where,
      order: orderBy,
      skip: (page - 1) * limit,
      take: limit,
      relations: ['post', 'post.user'],
    });
    const lastPage = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async create(entity: SavePostOrmEntity): Promise<SavePostOrmEntity> {
    return this.savePostRepository.save(entity);
  }

  async findAll(options: SearchOptions): Promise<PaginatedResult<SavePostOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = options;
    let where: FindOptionsWhere<SavePostOrmEntity>[] = [];
    if (searchFields && searchFields.length > 0 && !searchFields.includes('all')) {
      this.validateSearchFields(searchFields);
      where = this.buildWhereConditions(searchFields, searchValue || '');
    } else {
      where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
    }
    let orderBy: FindOptionsOrder<SavePostOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }
    const [data, total] = await this.savePostRepository.findAndCount({
      where,
      order: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });
    const lastPage = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findByUuid(uuid: string): Promise<SavePostOrmEntity> {
    const savePost = await this.savePostRepository.findOne({ where: { uuid } });
    if (!savePost) {
      throw new NotFoundException('Save post not found');
    }
    return savePost;
  }
  async findById(id: number): Promise<SavePostOrmEntity> {
    const savePost = await this.savePostRepository.findOne({ where: { id } });
    if (!savePost) {
      throw new NotFoundException('Save post not found');
    }
    return savePost;
  }
  async update(uuid: string, entity: SavePostOrmEntity): Promise<SavePostOrmEntity> {
    const { postUuid, userUuid } = entity;
    const savePost = await this.savePostRepository.findOne({ where: { uuid } });
    if (!savePost) {
      throw new NotFoundException('Save post not found');
    }
    return this.savePostRepository.save({ ...savePost, postUuid, userUuid });
  }
  async delete(uuid: string): Promise<void> {
    await this.savePostRepository.delete({ uuid });
  }
}
