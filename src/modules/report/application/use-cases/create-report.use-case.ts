import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '@/modules/report/domain/interfaces/report-repository.interface';
import { ReportOrmEntity, ReportContentType } from '../../infrastructure/orm/report.entity.orm';
@Injectable()
export class CreateReportUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(
    reporterUuid: string,
    contentUuid: string,
    contentType: string,
    details: string,
  ): Promise<ReportOrmEntity> {
    const newReport = new ReportOrmEntity();
    newReport.reporterUuid = reporterUuid;
    newReport.contentUuid = contentUuid;
    newReport.contentType = contentType as ReportContentType;
    newReport.details = details;
    newReport.createdAt = new Date();
    const report = await this.reportRepository.create(newReport);
    return report;
  }
}
