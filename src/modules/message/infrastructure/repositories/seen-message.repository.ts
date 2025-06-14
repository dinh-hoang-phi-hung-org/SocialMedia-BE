import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
import { SeenMessageOrmEntity } from '../orm/seen-message.entity.orm';
import { ISeenMessageRepository } from '@/modules/message/domain/interfaces/seen-message-repository.interface';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';

@Injectable()
export class SeenMessageRepository extends AbstractRepository<SeenMessageOrmEntity> implements ISeenMessageRepository {
  constructor(
    @InjectRepository(SeenMessageOrmEntity)
    private readonly seenMessageRepository: Repository<SeenMessageOrmEntity>,
  ) {
    super({
      searchableFields: ['messageUuid', 'userUuid'],
      sortableFields: ['createdAt'],
    });
  }

  async checkSeenMessage(messageUuid: string, userUuid: string): Promise<boolean> {
    const seenMessage = await this.seenMessageRepository.findOne({ where: { messageUuid, userUuid } });
    return !!seenMessage;
  }

  async create(entity: SeenMessageOrmEntity): Promise<SeenMessageOrmEntity> {
    return this.seenMessageRepository.save(entity);
  }

  async findAll(query: SearchOptions): Promise<PaginatedResult<SeenMessageOrmEntity>> {
    const { page, limit } = query;
    const where: FindOptionsWhere<SeenMessageOrmEntity>[] = [];

    const skip = (page - 1) * limit;
    const [seenMessages, total] = await this.seenMessageRepository.findAndCount({
      where: where,
      skip,
      take: limit,
    });
    const lastPage = Math.ceil(total / limit);
    return {
      data: seenMessages,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findByUuid(uuid: string): Promise<SeenMessageOrmEntity> {
    const seenMessage = await this.seenMessageRepository.findOne({ where: { uuid } });
    if (!seenMessage) {
      throw new NotFoundException('Seen message not found');
    }
    return seenMessage;
  }
  async findById(id: number): Promise<SeenMessageOrmEntity> {
    const seenMessage = await this.seenMessageRepository.findOne({ where: { id } });
    if (!seenMessage) {
      throw new NotFoundException('Seen message not found');
    }
    return seenMessage;
  }
  async update(uuid: string, entity: SeenMessageOrmEntity): Promise<SeenMessageOrmEntity> {
    return this.seenMessageRepository.save(entity);
  }
  async delete(uuid: string): Promise<void> {
    await this.seenMessageRepository.delete(uuid);
  }
}
