import { Injectable, NotFoundException } from '@nestjs/common';
import { IReactionRepository } from '@/modules/reactions/domain/interface/reaction-repository.interface';
import { ReactionOrmEntity } from '@/modules/reactions/infrastructure/orm/reaction.entity.orm';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';

@Injectable()
export class ReactionRepository extends AbstractRepository<ReactionOrmEntity> implements IReactionRepository {
  constructor(
    @InjectRepository(ReactionOrmEntity)
    private readonly reactionRepository: Repository<ReactionOrmEntity>,
  ) {
    super({
      searchableFields: ['userUuid'],
      sortableFields: ['createdAt'],
    });
  }

  async findByField(field: string, value: string): Promise<ReactionOrmEntity[]> {
    return this.reactionRepository.find({ where: { [field]: value } });
  }
  async checkIsReacted(contentUuid: string, userUuid: string, contentType: 'post' | 'comment'): Promise<boolean> {
    if (contentType === 'post') {
      const reaction = await this.reactionRepository.findOne({
        where: { postUuid: contentUuid, userUuid },
      });
      return !!reaction;
    } else {
      const reaction = await this.reactionRepository.findOne({
        where: { commentUuid: contentUuid, userUuid },
      });
      return !!reaction;
    }
  }
  async create(entity: ReactionOrmEntity): Promise<ReactionOrmEntity> {
    return this.reactionRepository.save(entity);
  }

  async findAll(query: SearchOptions): Promise<PaginatedResult<ReactionOrmEntity>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const [reactions, total] = await this.reactionRepository.findAndCount({
      skip,
      take: limit,
    });

    const lastPage = Math.ceil(total / limit);
    return {
      data: reactions,
      meta: {
        total,
        page: page,
        lastPage,
      },
    };
  }
  async findByUuid(uuid: string): Promise<ReactionOrmEntity> {
    const reaction = await this.reactionRepository.findOne({ where: { uuid } });
    if (!reaction) {
      throw new NotFoundException(`Reaction with UUID ${uuid} not found`);
    }
    return reaction;
  }
  async findById(id: number): Promise<ReactionOrmEntity> {
    const reaction = await this.reactionRepository.findOne({ where: { id } });
    if (!reaction) {
      throw new NotFoundException(`Reaction with ID ${id} not found`);
    }
    return reaction;
  }
  async update(uuid: string, entity: Partial<ReactionOrmEntity>): Promise<ReactionOrmEntity> {
    await this.findByUuid(uuid);
    await this.reactionRepository.update({ uuid }, entity);
    return this.findByUuid(uuid);
  }
  async delete(uuid: string): Promise<void> {
    const result = await this.reactionRepository.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Reaction with UUID ${uuid} not found`);
    }
  }

  async deleteByContentUuidAndUserUuid(
    contentUuid: string,
    userUuid: string,
    contentType: 'post' | 'comment',
  ): Promise<void> {
    if (contentType === 'post') {
      const result = await this.reactionRepository.delete({ postUuid: contentUuid, userUuid });
      if (result.affected === 0) {
        throw new NotFoundException(`Reaction with postUuid ${contentUuid} and userUuid ${userUuid} not found`);
      }
    } else {
      const result = await this.reactionRepository.delete({ commentUuid: contentUuid, userUuid });
      if (result.affected === 0) {
        throw new NotFoundException(`Reaction with commentUuid ${contentUuid} and userUuid ${userUuid} not found`);
      }
    }
  }
}
