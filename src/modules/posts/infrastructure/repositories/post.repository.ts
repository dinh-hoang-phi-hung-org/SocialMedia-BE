import { Injectable, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '@/modules/posts/domain/interfaces/post-repository.interface';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postRepository: Repository<PostOrmEntity>,
  ) {}

  async findAllByUuidUser(uuid: string, query: SearchOptions): Promise<PaginatedResult<PostOrmEntity>> {
    const { page, limit } = query;

    const where: FindOptionsWhere<PostOrmEntity>[] = [{ userUuid: uuid, isHidden: false }];

    const skip = (page - 1) * limit;
    const [posts, total] = await this.postRepository.findAndCount({
      where: where,
      skip,
      take: limit,
      relations: ['user'],
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
      throw new NotFoundException(`Post with UUID ${uuid} not found`);
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
}
