import { Injectable } from '@nestjs/common';
import { ReportOrmEntity } from '@/modules/report/infrastructure/orm/report.entity.orm';
import { ReportResponseDto } from '@/modules/report/presentation/dtos/report-response.dto';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { formatTime } from '@/shared/helpers/formatTime';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
@Injectable()
export class ReportMapper {
  constructor(private readonly userMapper: UserMapper) {}
  toDTO(report: ReportOrmEntity): ReportResponseDto {
    // console.log(report);
    return {
      uuid: report.uuid,
      reporterUuid: report.reporterUuid,
      contentUuid: report.contentUuid,
      contentType: report.contentType,
      details: report.details,
      createdAt: formatTime(report.createdAt),
      reporter: this.userMapper.toShortcutDTO(report.reporter),
      status: report.status,
      reviewedAt: formatTime(report.reviewedAt),
    };
  }

  toPaginatedDTO(paginatedResult: PaginatedResult<ReportOrmEntity>): PaginatedResult<ReportResponseDto> {
    return {
      data: paginatedResult.data.map((report) => this.toDTO(report)),
      meta: {
        total: paginatedResult.meta.total,
        page: paginatedResult.meta.page,
        lastPage: paginatedResult.meta.lastPage,
      },
    };
  }
}
