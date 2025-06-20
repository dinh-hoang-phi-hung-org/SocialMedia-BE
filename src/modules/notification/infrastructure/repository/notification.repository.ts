import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository, SortDirection } from 'typeorm';
import { NotificationOrmEntity } from '../orm/notification.entity.orm';
import { INotificationRepository } from '../../domain/interface/notification.interface';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';

@Injectable()
export class NotificationRepository
  extends AbstractRepository<NotificationOrmEntity>
  implements INotificationRepository
{
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly notificationRepository: Repository<NotificationOrmEntity>,
  ) {
    super({
      searchableFields: ['type', 'content'],
      sortableFields: ['createdAt'],
    });
  }

  findAll(query: SearchOptions): Promise<PaginatedResult<NotificationOrmEntity>> {
    throw new Error('Method not implemented.');
  }

  async findByUserUuid(userUuid: string, query: SearchOptions): Promise<PaginatedResult<NotificationOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;
    let where: FindOptionsWhere<NotificationOrmEntity>[] = [{ userUuid }];

    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
    }

    let orderBy: FindOptionsOrder<NotificationOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }

    const skip = (page - 1) * limit;
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: where,
      skip,
      take: limit,
      order: orderBy,
      relations: ['user'],
    });
    const lastPage = Math.ceil(total / limit);
    return {
      data: notifications,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  findByUuid(uuid: string): Promise<NotificationOrmEntity> {
    throw new Error('Method not implemented.');
  }
  findById(id: number): Promise<NotificationOrmEntity> {
    throw new Error('Method not implemented.');
  }
  update(uuid: string, entity: NotificationOrmEntity): Promise<NotificationOrmEntity> {
    throw new Error('Method not implemented.');
  }
  delete(uuid: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async create(notification: NotificationOrmEntity): Promise<NotificationOrmEntity> {
    return this.notificationRepository.save(notification);
  }

  async updateField(uuid: string, field: string, value: any): Promise<void> {
    await this.notificationRepository.update({ uuid }, { [field]: value });
  }
}
