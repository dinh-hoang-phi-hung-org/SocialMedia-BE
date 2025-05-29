import { Controller, Post, UseGuards, Body, Get, Query, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enum/role';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { CreateReportDto } from '@/modules/report/presentation/dtos/create-report.dto';
import { CreateReportUseCase } from '@/modules/report/application/use-cases/create-report.use-case';
import { SearchDto } from '@/shared/dtos/search-dto';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { GetAllReportUseCase } from '@/modules/report/application/use-cases/get-all-report.use-case';
import { SortDirection } from '@/shared/enum/sort-direction';
import { ReportMapper } from '@/modules/report/application/mapper/report.mapper';
import {
  ReportResponseDto,
  ReportResponseDtoWithComment,
  ReportResponseDtoWithPost,
} from '@/modules/report/presentation/dtos/report-response.dto';
import { GetAllReportWithTypeUseCase } from '@/modules/report/application/use-cases/get-all-report-type.use-case';
import { GetReportByUuidTypePostUseCase } from '../../application/use-cases/get-report-by-uuid-type-post';
import { GetReportByUuidTypeCommentUseCase } from '../../application/use-cases/get-report-by-uuid-type-comment';
import { CommentMapper } from '@/modules/comment/application/mapper/comment.mapper';
import { PostMapper } from '@/modules/posts/application/mapper/post.mapper';
import { UpdateStatusOfReportUseCase } from '@/modules/report/application/use-cases/update-status-of-report.use-case';
import { PostRepository } from '@/modules/posts/infrastructure/repositories/post.repository';
import { CommentRepository } from '@/modules/comment/infrastructure/repositories/comment.repository';
@ApiTags('Report')
@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(
    private readonly createReportUseCase: CreateReportUseCase,
    private readonly getAllReportUseCase: GetAllReportUseCase,
    private readonly getAllReportWithTypeUseCase: GetAllReportWithTypeUseCase,
    private readonly getReportByUuidTypePostUseCase: GetReportByUuidTypePostUseCase,
    private readonly getReportByUuidTypeCommentUseCase: GetReportByUuidTypeCommentUseCase,
    private readonly updateStatusOfReportUseCase: UpdateStatusOfReportUseCase,
    private readonly postRepository: PostRepository,
    private readonly reportMapper: ReportMapper,
    private readonly commentMapper: CommentMapper,
    private readonly postMapper: PostMapper,
    private readonly commentRepository: CommentRepository,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Report a post or comment' })
  async reportPostOrComment(
    @GetUser() currentUser: { uuid: string },
    @Body() createReportDto: CreateReportDto,
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    await this.createReportUseCase.execute(
      currentUser.uuid,
      createReportDto.contentUuid,
      createReportDto.contentType,
      createReportDto.details,
    );
    return new ApiSuccessResponse({
      message: 'Report created successfully',
    });
  }

  @Get('all')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all reports' })
  async getReports(@Query() searchDto: SearchDto): Promise<ApiSuccessResponse<PaginatedResult<ReportResponseDto>>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];
    const result = await this.getAllReportUseCase.execute({
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });
    return new ApiSuccessResponse(this.reportMapper.toPaginatedDTO(result));
  }

  @Get(':type/:uuid')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a report by type and uuid' })
  async getReportByTypeAndUuid(
    @Param('type') type: string,
    @Param('uuid') uuid: string,
  ): Promise<ApiSuccessResponse<ReportResponseDtoWithPost | ReportResponseDtoWithComment>> {
    if (type === 'post') {
      const result = await this.getReportByUuidTypePostUseCase.execute(uuid);
      const reportDto = this.reportMapper.toDTO(result.report);
      return new ApiSuccessResponse({
        report: reportDto,
        post: this.postMapper.toDTO(result.post),
      });
    } else if (type === 'comment') {
      const result = await this.getReportByUuidTypeCommentUseCase.execute(uuid);
      const reportDto = this.reportMapper.toDTO(result.report);
      const commentDto = this.commentMapper.toDTO(result.comment);
      const parentCommentDto = result.parentComment ? this.commentMapper.toDTO(result.parentComment) : undefined;
      const postDto = this.postMapper.toDTO(result.post);
      return new ApiSuccessResponse({
        report: reportDto,
        comment: commentDto,
        parentComment: parentCommentDto,
        post: postDto,
      });
    }

    throw new Error(`Unsupported report type: ${type}`);
  }

  @Get(':type')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all reports for a specific type' })
  async getReportsForType(
    @Param('type') type: string,
    @Query() searchDto: SearchDto,
  ): Promise<ApiSuccessResponse<PaginatedResult<ReportResponseDto>>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];

    const result = await this.getAllReportWithTypeUseCase.execute(type, {
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });
    return new ApiSuccessResponse(this.reportMapper.toPaginatedDTO(result));
  }

  @Patch('/:type/update-status/:uuid/:status')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update the status of a report' })
  async updateReportStatus(@Param('uuid') uuid: string, @Param('status') status: string, @Param('type') type: string) {
    await this.updateStatusOfReportUseCase.execute(uuid, status);
    if (status === 'banned') {
      if (type === 'post') {
        const report = await this.getReportByUuidTypePostUseCase.execute(uuid);
        await this.postRepository.softDelete(report.post.uuid, 'isDeleted', true);
        return new ApiSuccessResponse({
          message: 'Post deleted successfully',
        });
      } else if (type === 'comment') {
        const report = await this.getReportByUuidTypeCommentUseCase.execute(uuid);
        await this.commentRepository.updateField(report.comment.uuid, 'isDeleted', true);
        return new ApiSuccessResponse({
          message: 'Comment deleted successfully',
        });
      }
    }
  }
}
