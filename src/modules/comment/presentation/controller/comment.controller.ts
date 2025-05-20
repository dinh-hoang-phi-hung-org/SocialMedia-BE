import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Query,
  UploadedFiles,
  BadRequestException,
  HttpStatus,
  ParseFilePipeBuilder,
  UseInterceptors,
} from '@nestjs/common';
import { PostCommentUseCase } from '../../application/use-cases/post-comment.use-case';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { PostCommentDto, CommentResponseDto } from '../dtos/comment.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enum/role';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchDto } from '@/shared/dtos/search-dto';
import { GetCommentByPostUuidUseCase } from '../../application/use-cases/get-comment-by-post-uuid.use-case';
import { SortDirection } from '@/shared/enum/sort-direction';
import { CommentMapper } from '../../application/mapper/comment.mapper';
import { GetCommentByPostUuidAndParentUuidUseCase } from '../../application/use-cases/get-comment-by-post-uuid-and-parent-uuid.use-case';
import { MediaFile, StorageService } from '@/modules/storage/storage.service';
import { FileType } from '@/shared/enum/file-type';
import { UpdateCommentToCreateUseCase } from '../../application/use-cases/update-comment-to-create.use-case';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  private readonly MAX_IMAGES = 10;
  private readonly MAX_VIDEOS = 3;
  constructor(
    private readonly postCommentUseCase: PostCommentUseCase,
    private readonly getCommentsByPostUuidUseCase: GetCommentByPostUuidUseCase,
    private readonly getCommentsByPostUuidAndParentUuidUseCase: GetCommentByPostUuidAndParentUuidUseCase,
    private readonly commentMapper: CommentMapper,
    private readonly storageService: StorageService,
    private readonly updateCommentToCreateUseCase: UpdateCommentToCreateUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Post content text (required)',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Media files to upload (up to 10 images and 3 videos, optional)',
        },
        parentUuid: {
          type: 'string',
          description: 'Parent comment UUID (optional)',
        },
        postUuid: {
          type: 'string',
          description: 'Post UUID (required)',
        },
      },
      required: ['content', 'postUuid'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 13))
  async postComment(
    @GetUser() user: { uuid: string },
    @Body() body: PostCommentDto,
    @UploadedFiles(
      new ParseFilePipeBuilder().addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 }).build({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        fileIsRequired: false,
      }),
    ) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    files: Array<any>,
  ): Promise<ApiSuccessResponse<{ message: string; commentUuid: string }>> {
    if (files && files.length > 0) {
      const imageFiles = files.filter((file) => this.storageService.getMediaType(file.mimetype) === FileType.IMAGE);
      const videoFiles = files.filter((file) => this.storageService.getMediaType(file.mimetype) === FileType.VIDEO);

      if (imageFiles.length > this.MAX_IMAGES) {
        throw new BadRequestException(`Maximum ${this.MAX_IMAGES} images are allowed`);
      }
      if (videoFiles.length > this.MAX_VIDEOS) {
        throw new BadRequestException(`Maximum ${this.MAX_VIDEOS} videos are allowed`);
      }
    }
    const newComment = await this.postCommentUseCase.execute(body.postUuid, user.uuid, body.content, body.parentUuid);

    let mediaFiles: MediaFile[] = [];

    if (files && files.length > 0) {
      try {
        const uploadPath = `comments/${body.postUuid}/${newComment.uuid}`;
        mediaFiles = await this.storageService.uploadMultipleFiles(files, uploadPath);

        const mediaObject = {
          images: mediaFiles.filter((file) => file.type === FileType.IMAGE),
          videos: mediaFiles.filter((file) => file.type === FileType.VIDEO),
        };

        await this.updateCommentToCreateUseCase.execute({
          commentUuid: newComment.uuid,
          mediaUrl: JSON.stringify(mediaObject),
        });
      } catch (error) {
        console.error(`Error uploading files for comment ${newComment.uuid}:`, error);
        await this.deleteCommentUseCase.execute(newComment.uuid);

        // Re-throw the error
        throw new BadRequestException(`Failed to upload files: ${error.message}`);
      }
    }

    return new ApiSuccessResponse({
      message: 'Comment created successfully',
      commentUuid: newComment.uuid,
    });
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  async getCommentsByPostUuid(
    @Param('uuid') uuid: string,
    @Query() searchDto: SearchDto,
  ): Promise<ApiSuccessResponse<PaginatedResult<CommentResponseDto>>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];
    const result = await this.getCommentsByPostUuidUseCase.execute(uuid, {
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });
    return new ApiSuccessResponse(this.commentMapper.toPaginatedDTO(result));
  }

  @Get(':uuid/:parentUuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  async getCommentsByPostUuidAndParentUuid(
    @Param('uuid') uuid: string,
    @Param('parentUuid') parentUuid: string,
    @Query() searchDto: SearchDto,
  ): Promise<ApiSuccessResponse<PaginatedResult<CommentResponseDto>>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];
    const result = await this.getCommentsByPostUuidAndParentUuidUseCase.execute(uuid, parentUuid, {
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });
    return new ApiSuccessResponse(this.commentMapper.toPaginatedDTO(result));
  }
}
