import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReportRepository } from '@/modules/report/domain/interfaces/report-repository.interface';
import { ICommentRepository } from '@/modules/comment/domain/interfaces/comment-repository.interface';
import { CommentOrmEntity } from '@/modules/comment/infrastructure/orm/comment.entity.orm';
import { IPostRepository } from '@/modules/posts/domain/interfaces/post-repository.interface';
@Injectable()
export class GetReportByUuidTypeCommentUseCase {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(uuid: string) {
    const report = await this.reportRepository.findByUuid(uuid);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const comment = await this.commentRepository.findByUuid(report.contentUuid);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const post = await this.postRepository.findByUuid(comment.postUuid);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    let parentComment: CommentOrmEntity | null = null;

    if (comment.parentUuid) {
      const parentComment = await this.commentRepository.findByUuid(comment.parentUuid);
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    return {
      post,
      report,
      comment,
      parentComment,
    };
  }
}
