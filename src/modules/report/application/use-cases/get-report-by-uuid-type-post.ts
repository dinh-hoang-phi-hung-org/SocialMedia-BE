import { Injectable, Inject } from '@nestjs/common';
import { IReportRepository } from '../../domain/interfaces/report-repository.interface';
import { ReportOrmEntity } from '../../infrastructure/orm/report.entity.orm';
import { IPostRepository } from '@/modules/posts/domain/interfaces/post-repository.interface';

@Injectable()
export class GetReportByUuidTypePostUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(uuid: string): Promise<{ report: ReportOrmEntity; post: any }> {
    const report = await this.reportRepository.findByUuid(uuid);
    const post = await this.postRepository.findByUuid(report.contentUuid);
    return { report, post };
  }
}
