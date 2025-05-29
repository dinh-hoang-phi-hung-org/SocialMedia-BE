import { IBaseRepository } from '@/shared/base/base-repository.interface';
import { ReportOrmEntity } from '../../infrastructure/orm/report.entity.orm';
import { SearchOptions } from '@/shared/types/search-options';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
export interface IReportRepository extends IBaseRepository<ReportOrmEntity> {
  findAllByType(type: string, query: SearchOptions): Promise<PaginatedResult<ReportOrmEntity>>;
}
