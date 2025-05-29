import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsOrder, FindOptionsWhere, Repository, SortDirection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
import { AbstractRepository } from '@/shared/repositories/abstract.repository';
import { IReportRepository } from '@/modules/report/domain/interfaces/report-repository.interface';
import { ReportContentType, ReportOrmEntity } from '@/modules/report/infrastructure/orm/report.entity.orm';

@Injectable()
export class ReportRepository extends AbstractRepository<ReportOrmEntity> implements IReportRepository {
  constructor(
    @InjectRepository(ReportOrmEntity)
    private readonly reportRepository: Repository<ReportOrmEntity>,
  ) {
    super({
      searchableFields: ['reporterUuid', 'contentType', 'contentUuid', 'status'],
      sortableFields: ['createdAt', 'reviewedAt'],
    });
  }

  async findAllByType(type: string, query: SearchOptions): Promise<PaginatedResult<ReportOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    let where: FindOptionsWhere<ReportOrmEntity>[] = [{ contentType: type as ReportContentType }];
    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
      where = where.map((w) => ({ ...w, contentType: type as ReportContentType }));
    }

    let orderBy: FindOptionsOrder<ReportOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }

    const skip = (page - 1) * limit;
    const [reports, total] = await this.reportRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: orderBy,
      relations: ['reporter'],
    });

    const lastPage = Math.ceil(total / limit);
    return {
      data: reports,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async create(entity: ReportOrmEntity): Promise<ReportOrmEntity> {
    return this.reportRepository.save(entity);
  }

  async findAll(query: SearchOptions): Promise<PaginatedResult<ReportOrmEntity>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = query;

    let where: FindOptionsWhere<ReportOrmEntity>[] = [];
    if (searchFields && searchFields.length > 0) {
      if (!searchFields.includes('all')) {
        this.validateSearchFields(searchFields);
        where = this.buildWhereConditions(searchFields, searchValue || '');
      } else {
        where = this.buildWhereConditions(this.options.searchableFields, searchValue || '');
      }
    }

    let orderBy: FindOptionsOrder<ReportOrmEntity>;
    if (sortBy && sortBy != '') {
      this.validateSortFields(sortBy);
      orderBy = { [sortBy]: sortDirection as unknown as SortDirection };
    } else {
      orderBy = { createdAt: 'DESC' };
    }

    const skip = (page - 1) * limit;
    const [reports, total] = await this.reportRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: orderBy,
      relations: ['reporter'],
    });

    const lastPage = Math.ceil(total / limit);
    return {
      data: reports,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findByUuid(uuid: string): Promise<ReportOrmEntity> {
    const report = await this.reportRepository.findOne({
      where: { uuid },
      relations: ['reporter'],
    });
    if (!report) {
      throw new NotFoundException(`Report with UUID ${uuid} not found`);
    }
    return report;
  }

  async findById(id: number): Promise<ReportOrmEntity> {
    const report = await this.reportRepository.findOne({
      where: { id },
    });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(uuid: string, entity: ReportOrmEntity): Promise<ReportOrmEntity> {
    await this.findByUuid(uuid); // Verify post exists
    await this.reportRepository.update({ uuid }, entity);
    return this.findByUuid(uuid); // This now loads the user relation
  }

  async delete(uuid: string): Promise<void> {
    const result = await this.reportRepository.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Report with UUID ${uuid} not found`);
    }
  }
}
