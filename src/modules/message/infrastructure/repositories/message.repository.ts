import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsOrder, SortDirection } from 'typeorm';
import { MessageOrmEntity } from '../orm/message.entity.orm';
import { IMessageRepository } from '@/modules/message/domain/interfaces/message-repository.interface';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';

@Injectable()
export class MessageRepository extends AbstractRepository<MessageOrmEntity> implements IMessageRepository {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
  ) {
    super({
      searchableFields: ['conversationUuid', 'senderUuid', 'content'],
      sortableFields: ['createdAt'],
    });
  }
  async getLastMessageAndLastTime(conversationUuid: string): Promise<MessageOrmEntity> {
    const message = await this.messageRepository.findOne({
      where: { conversationUuid },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async create(entity: MessageOrmEntity): Promise<MessageOrmEntity> {
    return this.messageRepository.save(entity);
  }

  async findAll(query: SearchOptions): Promise<PaginatedResult<MessageOrmEntity>> {
    const { page, limit } = query;
    const where: FindOptionsWhere<MessageOrmEntity>[] = [];

    const skip = (page - 1) * limit;
    const [messages, total] = await this.messageRepository.findAndCount({
      where: where,
      skip,
      take: limit,
    });
    const lastPage = Math.ceil(total / limit);
    return {
      data: messages,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findByUuid(uuid: string): Promise<MessageOrmEntity> {
    const message = await this.messageRepository.findOne({ where: { uuid } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async findById(id: number): Promise<MessageOrmEntity> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async update(uuid: string, entity: MessageOrmEntity): Promise<MessageOrmEntity> {
    await this.findByUuid(uuid);
    await this.messageRepository.update({ uuid }, entity);
    return this.findByUuid(uuid);
  }

  async delete(uuid: string): Promise<void> {
    const result = await this.messageRepository.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Message with UUID ${uuid} not found`);
    }
  }

  async getMessagesByConversationUuid(
    conversationUuid: string,
    query: SearchOptions,
  ): Promise<PaginatedResult<MessageOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    let where: FindOptionsWhere<MessageOrmEntity>[] = [{ conversationUuid: conversationUuid }];

    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
      // Add conversation condition to each where clause
      where = where.map((w) => ({ ...w, conversationUuid: conversationUuid }));
    }

    let orderBy: FindOptionsOrder<MessageOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }

    const skip = (page - 1) * limit;
    const [messages, total] = await this.messageRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: orderBy,
      relations: ['sender'],
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: messages,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }
}
