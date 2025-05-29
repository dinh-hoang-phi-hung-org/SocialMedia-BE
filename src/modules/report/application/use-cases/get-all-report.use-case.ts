import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '@/modules/report/domain/interfaces/report-repository.interface';
import { ReportOrmEntity } from '../../infrastructure/orm/report.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
@Injectable()
export class GetAllReportUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(searchDto: SearchOptions): Promise<PaginatedResult<ReportOrmEntity>> {
    const result = await this.reportRepository.findAll(searchDto);
    return result;
  }
}
