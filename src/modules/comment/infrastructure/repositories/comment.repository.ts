import { Injectable, NotFoundException } from '@nestjs/common';
import { ICommentRepository } from '../../domain/interfaces/comment-repository.interface';
import { CommentOrmEntity } from '../orm/comment.entity.orm';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
import { FindOptionsOrder, FindOptionsWhere, IsNull, Repository, SortDirection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class CommentRepository extends AbstractRepository<CommentOrmEntity> implements ICommentRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly commentRepository: Repository<CommentOrmEntity>,
  ) {
    super({
      searchableFields: ['postUuid', 'userUuid', 'content', 'parentUuid'],
      sortableFields: ['createdAt'],
    });
  }

  async findByField(field: string, value: string): Promise<CommentOrmEntity[]> {
    const comments = await this.commentRepository.find({
      where: { [field]: value, isDeleted: false },
      relations: ['user', 'post'],
    });
    return comments;
  }

  async findAllByPostUuidAndParentUuid(
    postUuid: string,
    parentUuid: string,
    query: SearchOptions,
  ): Promise<PaginatedResult<CommentOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;
    let where: FindOptionsWhere<CommentOrmEntity>[] = [{ postUuid, isDeleted: false, parentUuid }];
    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
      where = where.map((w) => ({ ...w, isDeleted: false, postUuid, parentUuid }));
    }

    let orderBy: FindOptionsOrder<CommentOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createAt: 'DESC' };
    }
    const skip = (page - 1) * limit;
    const [comments, total] = await this.commentRepository.findAndCount({
      where,
      order: orderBy,
      skip,
      take: limit,
      relations: ['user', 'post'],
    });
    const lastPage = Math.ceil(total / limit);
    return {
      data: comments,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findAllByPostUuid(postUuid: string, query: SearchOptions): Promise<PaginatedResult<CommentOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;
    let where: FindOptionsWhere<CommentOrmEntity>[] = [{ postUuid, isDeleted: false, parentUuid: IsNull() }];
    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
    }

    let orderBy: FindOptionsOrder<CommentOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createAt: 'DESC' };
    }
    const skip = (page - 1) * limit;
    const [comments, total] = await this.commentRepository.findAndCount({
      where,
      order: orderBy,
      skip,
      take: limit,
      relations: ['user', 'post'],
    });
    const lastPage = Math.ceil(total / limit);
    return {
      data: comments,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async create(entity: CommentOrmEntity): Promise<CommentOrmEntity> {
    entity.uuid = uuidv4();
    return this.commentRepository.save(entity);
  }

  async findAll(query: SearchOptions): Promise<PaginatedResult<CommentOrmEntity>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const [comments, total] = await this.commentRepository.findAndCount({
      skip,
      take: limit,
    });

    const lastPage = Math.ceil(total / limit);
    return {
      data: comments,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findByUuid(uuid: string): Promise<CommentOrmEntity> {
    const comment = await this.commentRepository.findOne({
      where: { uuid },
      relations: ['user', 'post'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment with UUID ${uuid} not found`);
    }
    return comment;
  }

  async findById(id: number): Promise<CommentOrmEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async update(uuid: string, entity: CommentOrmEntity): Promise<CommentOrmEntity> {
    await this.findByUuid(uuid); // Verify post exists
    await this.commentRepository.update({ uuid }, entity);
    return this.findByUuid(uuid);
  }

  async updateField(uuid: string, field: string, value: any): Promise<CommentOrmEntity> {
    await this.findByUuid(uuid); // Verify post exists
    await this.commentRepository.update({ uuid }, { [field]: value });
    return this.findByUuid(uuid);
  }

  async delete(uuid: string): Promise<void> {
    const result = await this.commentRepository.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with UUID ${uuid} not found`);
    }
  }
}
