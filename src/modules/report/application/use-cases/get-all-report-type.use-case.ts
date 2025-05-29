import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '@/modules/report/domain/interfaces/report-repository.interface';
import { ReportOrmEntity } from '../../infrastructure/orm/report.entity.orm';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchOptions } from '@/shared/types/search-options';
@Injectable()
export class GetAllReportWithTypeUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(type: string, searchDto: SearchOptions): Promise<PaginatedResult<ReportOrmEntity>> {
    const result = await this.reportRepository.findAllByType(type, searchDto);
    return result;
  }
}
