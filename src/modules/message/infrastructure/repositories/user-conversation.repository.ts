import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository, SortDirection } from 'typeorm';
import { UserConversation } from '../orm/user-conversation.entity.orm';
import { IUserConversationRepository } from '@/modules/message/domain/interfaces/user-conversation-repository.interface';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';

@Injectable()
export class UserConversationRepository
  extends AbstractRepository<UserConversation>
  implements IUserConversationRepository
{
  constructor(
    @InjectRepository(UserConversation)
    private readonly userConversationRepository: Repository<UserConversation>,
  ) {
    super({
      searchableFields: ['uuid'],
      sortableFields: ['createdAt'],
    });
  }
  async findByUuidConversationAndUserUuid(
    conversationUuid: string,
    userUuid: string,
  ): Promise<UserConversation | null> {
    return this.userConversationRepository.findOne({
      where: { conversationUuid, userUuid },
    }) as Promise<UserConversation | null>;
  }

  async getUserConversations(userId: string, query: SearchOptions): Promise<PaginatedResult<UserConversation>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    let where: FindOptionsWhere<UserConversation>[] = [{ userUuid: userId }];

    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
    }

    let orderBy: FindOptionsOrder<UserConversation>;
    if (sortBy && sortBy != '') {
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection, createdAt: 'ASC' };
    } else {
      orderBy = { createdAt: 'ASC' };
    }

    const skip = (page - 1) * limit;
    const [userConversations, total] = await this.userConversationRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: orderBy,
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: userConversations,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }
  async create(entity: UserConversation): Promise<UserConversation> {
    return this.userConversationRepository.save(entity);
  }

  async findAll(query: SearchOptions): Promise<PaginatedResult<UserConversation>> {
    const { page, limit } = query;
    const where: FindOptionsWhere<UserConversation>[] = [];
    const skip = (page - 1) * limit;
    const [userConversations, total] = await this.userConversationRepository.findAndCount({
      where,
      skip,
      take: limit,
    });
    const lastPage = Math.ceil(total / limit);

    return {
      data: userConversations,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findByUuid(uuid: string): Promise<UserConversation> {
    const userConversation = await this.userConversationRepository.findOne({
      where: { uuid },
    });
    if (!userConversation) {
      throw new NotFoundException('User conversation not found');
    }
    return userConversation;
  }

  async findById(id: number): Promise<UserConversation> {
    const userConversation = await this.userConversationRepository.findOne({
      where: { id },
    });
    if (!userConversation) {
      throw new NotFoundException('User conversation not found');
    }
    return userConversation;
  }

  async update(uuid: string, entity: UserConversation): Promise<UserConversation> {
    await this.findByUuid(uuid);
    await this.userConversationRepository.update({ uuid }, entity);
    return this.findByUuid(uuid);
  }

  async delete(uuid: string): Promise<void> {
    const result = await this.userConversationRepository.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException('User conversation not found');
    }
  }
}
