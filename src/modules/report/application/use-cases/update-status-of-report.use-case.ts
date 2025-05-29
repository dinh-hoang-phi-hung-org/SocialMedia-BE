import { Inject, Injectable } from '@nestjs/common';
import { IReportRepository } from '@/modules/report/domain/interfaces/report-repository.interface';
import { ReportOrmEntity, ReportStatus } from '../../infrastructure/orm/report.entity.orm';

@Injectable()
export class UpdateStatusOfReportUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
  ) {}

  async execute(uuid: string, status: string): Promise<ReportOrmEntity> {
    const report = await this.reportRepository.findByUuid(uuid);
    report.status = status as ReportStatus;
    report.reviewedAt = new Date();
    return this.reportRepository.update(uuid, report);
  }
}
