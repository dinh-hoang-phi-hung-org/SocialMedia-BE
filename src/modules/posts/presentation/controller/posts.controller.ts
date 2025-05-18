import { CreatePostDto } from '@/modules/posts/presentation/dtos/create-post-dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ParseFilePipeBuilder,
  HttpStatus,
  UseGuards,
  Get,
  Query,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { CreatePostUseCase } from '@/modules/posts/application/use-cases/create-post.use-case';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { StorageService, MediaFile } from '@/modules/storage/storage.service';
import { UpdatePostUseCase } from '@/modules/posts/application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '@/modules/posts/application/use-cases/delete-post.use-case';
import { FileType } from '@/shared/enum/file-type';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { GetPostsByUuidUserUseCase } from '@/modules/posts/application/use-cases/get-posts-by-uuid-user.use-case';
import { Param } from '@nestjs/common';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchDto } from '@/shared/dtos/search-dto';
import { PostResponseDto } from '../dtos/post-reponse.dto';
import { PostMapper } from '@/modules/posts/application/mapper/post.mapper';
import { GetPostByUuidUseCase } from '@/modules/posts/application/use-cases/get-post-by-uuid.use-case';
import { AdjustUserPostsCountUseCase } from '@/modules/posts/application/use-cases/adjust-user-posts-count.use-case';
import { UserRole } from '@/shared/enum/role';
import { Roles } from '@/shared/decorators/roles.decorator';
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  private readonly MAX_IMAGES = 10;
  private readonly MAX_VIDEOS = 3;

  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly storageService: StorageService,
    private readonly adjustUserPostsCountUseCase: AdjustUserPostsCountUseCase,
    private readonly getPostsByUuidUserUseCase: GetPostsByUuidUserUseCase,
    private readonly getPostByUuidUseCase: GetPostByUuidUseCase,
    private readonly postMapper: PostMapper,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Create a new post with optional media upload (max 10 images and 3 videos)' })
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
      },
      required: ['content'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 13))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles(
      new ParseFilePipeBuilder().addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 }).build({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        fileIsRequired: false,
      }),
    ) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    files: Array<any>,
    @GetUser() user: { uuid: string },
  ): Promise<
    ApiSuccessResponse<{
      message: string;
      postUuid: string;
    }>
  > {
    if (!createPostDto.content) {
      throw new BadRequestException('Post must contain content');
    }

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

    const newPost = await this.createPostUseCase.execute({
      userUuid: user.uuid,
      content: createPostDto.content,
    });

    let mediaFiles: MediaFile[] = [];

    if (files && files.length > 0) {
      try {
        const uploadPath = `posts/${user.uuid}/${newPost.uuid}`;
        mediaFiles = await this.storageService.uploadMultipleFiles(files, uploadPath);

        const mediaObject = {
          images: mediaFiles.filter((file) => file.type === FileType.IMAGE),
          videos: mediaFiles.filter((file) => file.type === FileType.VIDEO),
        };

        await this.updatePostUseCase.execute({
          postUuid: newPost.uuid,
          mediaUrl: JSON.stringify(mediaObject),
        });
      } catch (error) {
        console.error(`Error uploading files for post ${newPost.uuid}:`, error);
        await this.deletePostUseCase.execute(newPost.uuid);

        // Re-throw the error
        throw new BadRequestException(`Failed to upload files: ${error.message}`);
      }
    }

    await this.adjustUserPostsCountUseCase.execute(user.uuid, true);

    return new ApiSuccessResponse({
      message: 'Post created successfully',
      postUuid: newPost.uuid,
    });
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getPost(@Param('uuid') uuid: string): Promise<ApiSuccessResponse<PostResponseDto>> {
    const post = await this.getPostByUuidUseCase.execute(uuid);
    return new ApiSuccessResponse(this.postMapper.toDTO(post));
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async deletePost(
    @GetUser() user: { uuid: string },
    @Param('uuid') uuid: string,
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    const post = await this.getPostByUuidUseCase.execute(uuid);
    if (post.user.uuid !== user.uuid) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }
    if (post.mediaUrl) {
      await this.storageService.deleteFolder(`posts/${user.uuid}/${uuid}`);
    }
    await this.deletePostUseCase.execute(uuid);

    await this.adjustUserPostsCountUseCase.execute(user.uuid, false);

    return new ApiSuccessResponse({
      message: 'Post deleted successfully',
    });
  }

  @Get('/user/:uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async getPostsByUuidUser(
    @Param('uuid') uuid: string,
    @Query() searchDto: SearchDto,
  ): Promise<ApiSuccessResponse<PaginatedResult<PostResponseDto>>> {
    const { page, limit } = searchDto;
    const post = await this.getPostsByUuidUserUseCase.execute(uuid, {
      page,
      limit,
    });
    return new ApiSuccessResponse(this.postMapper.toPaginatedDTO(post));
  }
}
