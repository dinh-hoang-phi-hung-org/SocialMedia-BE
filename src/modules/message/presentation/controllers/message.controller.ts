import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  ParseFilePipeBuilder,
  BadRequestException,
} from '@nestjs/common';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { FindUuidConversationUseCase } from '@/modules/message/application/use-cases/find-uuid-conversation.use-case';
import { ApiFailureResponse, ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { SendMessageDto, MessageResponseDto } from '../dtos/message.dto';
import { GetHistoryMessageOfConversationUseCase } from '@/modules/message/application/use-cases/get-history-message-of-conversation.use-case';
import { SearchDto } from '@/shared/dtos/search-dto';
import { SortDirection } from '@/shared/enum/sort-direction';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { ConversationResponseDto } from '../dtos/conversation.dto';
import { MessageMapper } from '@/modules/message/application/mapper/message.mapper';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaFile, StorageService } from '@/modules/storage/storage.service';
import { FileType } from '@/shared/enum/file-type';
import { CreateConversationUseCase } from '@/modules/message/application/use-cases/create-conversation.use-case';
import { CreateUserConversationUseCase } from '@/modules/message/application/use-cases/create-user-conversation.use-case';
import { GetConversationsUseCase } from '@/modules/message/application/use-cases/get-conversations.use-case';
import { FindDetailUserByUuidConversationUseCase } from '../../application/use-cases/find-detail-user-by-uuid-conversation.use-case';
import { GetLastMessageAndLastTimeUseCase } from '../../application/use-cases/get-last-message-and-last-time.use-case';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
@ApiTags('Messages')
@Controller('messages')
export class MessageController {
  private readonly MAX_IMAGES = 10;
  private readonly MAX_VIDEOS = 3;
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly findUuidConversationUseCase: FindUuidConversationUseCase,
    private readonly getHistoryMessageOfConversationUseCase: GetHistoryMessageOfConversationUseCase,
    private readonly messageMapper: MessageMapper,
    private readonly storageService: StorageService,
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly createUserConversationUseCase: CreateUserConversationUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly findDetailUserByUuidConversationUseCase: FindDetailUserByUuidConversationUseCase,
    private readonly getLastMessageAndLastTimeUseCase: GetLastMessageAndLastTimeUseCase,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Send a message to conversation' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        conversationUuid: {
          type: 'string',
          description: 'Conversation UUID',
        },
        receiverUuid: {
          type: 'string',
          description: 'Receiver UUID',
        },
        content: {
          type: 'string',
          description: 'Post content text',
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
      required: ['receiverUuid', 'content'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 13))
  async sendMessage(
    @GetUser() user: { uuid: string },
    @Body() messageDto: SendMessageDto,
    @UploadedFiles(
      new ParseFilePipeBuilder().addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 }).build({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        fileIsRequired: false,
      }),
    ) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    files: Array<any>,
  ): Promise<
    ApiSuccessResponse<{ message: string; conversationUuid: string }> | ApiFailureResponse<{ message: string }>
  > {
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

    let mediaFiles: MediaFile[] = [];
    let mediaObject: { images: MediaFile[]; videos: MediaFile[] } = { images: [], videos: [] };

    if (files && files.length > 0) {
      try {
        const uploadPath = `messages/${messageDto.conversationUuid}`;
        mediaFiles = await this.storageService.uploadMultipleFiles(files, uploadPath);

        mediaObject = {
          images: mediaFiles.filter((file) => file.type === FileType.IMAGE),
          videos: mediaFiles.filter((file) => file.type === FileType.VIDEO),
        };
      } catch (error) {
        console.error(`Error uploading files for message ${messageDto.conversationUuid}:`, error);

        // Re-throw the error
        throw new BadRequestException(`Failed to upload files: ${error.message}`);
      }
    }

    // Xác định xem có phải conversation mới không
    let isNewConversation = false;

    if (!messageDto.conversationUuid) {
      const isExistConversation = await this.findUuidConversationUseCase.execute(user.uuid, messageDto.receiverUuid);
      if (isExistConversation) {
        messageDto.conversationUuid = isExistConversation.uuid;
        isNewConversation = false;
      } else {
        const conversation = await this.createConversationUseCase.execute(false, '');
        messageDto.conversationUuid = conversation.uuid;
        isNewConversation = true;

        if (user.uuid !== messageDto.receiverUuid) {
          await this.createUserConversationUseCase.execute(conversation.uuid, user.uuid);
          await this.createUserConversationUseCase.execute(conversation.uuid, messageDto.receiverUuid);
        } else {
          await this.createUserConversationUseCase.execute(conversation.uuid, user.uuid);
        }
      }
    }

    const message = await this.sendMessageUseCase.execute(
      messageDto.conversationUuid,
      user.uuid,
      messageDto.content,
      mediaObject,
      isNewConversation,
    );
    if (message) {
      return new ApiSuccessResponse({
        message: 'Message sent successfully',
        conversationUuid: messageDto.conversationUuid,
      });
    }
    return new ApiFailureResponse(['Failed to send message']);
  }

  @Get('conversation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get history of conversation between two users' })
  async getUuidConversation(
    @GetUser() user: { uuid: string },
    @Query('receiverUuid') receiverUuid: string,
    @Query() searchDto: SearchDto,
  ): Promise<
    ApiSuccessResponse<{
      conversation: ConversationResponseDto;
      messages: PaginatedResult<MessageResponseDto>;
    }>
  > {
    const receiver = await this.userRepository.findByUuid(receiverUuid);
    const conversation = await this.findUuidConversationUseCase.execute(user.uuid, receiverUuid);
    if (!conversation) {
      return new ApiSuccessResponse({
        conversation: {
          conversationUuid: '',
          conversationTitle: receiver.username,
          conversationUrl: receiver.profile_picture_url,
        },
        messages: {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            lastPage: 1,
          },
        },
      });
    }

    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];

    const history = await this.getHistoryMessageOfConversationUseCase.execute(conversation.uuid, {
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });

    return new ApiSuccessResponse({
      conversation: {
        conversationUuid: conversation.uuid,
        conversationTitle: conversation.isGroupChat ? conversation.title : receiver.username,
        conversationUrl: conversation.isGroupChat ? undefined : receiver.profile_picture_url,
      },
      messages: this.messageMapper.toPaginatedDTO(history, user.uuid),
    });
  }

  // @Get('conversation/:conversationId')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access-token')
  // @ApiOperation({ summary: 'Get messages from a conversation' })
  // async getConversationMessages(@Req() req, @Param('conversationId') conversationId: string) {
  //   return this.sendMessageUseCase.getConversationMessages(req.user.id, conversationId);
  // }

  // @Post('conversation/create')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access-token')
  // @ApiOperation({ summary: 'Create a new group conversation' })
  // async createConversation(
  //   @Req() req,
  //   @Body() createConversationDto: { participantIds: string[]; isGroupChat?: boolean; title?: string },
  // ) {
  //   return this.sendMessageUseCase.createConversation(
  //     req.user.id,
  //     createConversationDto.participantIds,
  //     createConversationDto.isGroupChat,
  //     createConversationDto.title,
  //   );
  // }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  async getUserConversations(
    @GetUser() user: { uuid: string },
    @Query() searchDto: SearchDto,
  ): Promise<ApiSuccessResponse<PaginatedResult<ConversationResponseDto>>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];
    const conversations = await this.getConversationsUseCase.execute(user.uuid, {
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });
    // console.log('conversations: ', conversations);
    const conversation = await Promise.all(
      conversations.data.map(async (conversation) => {
        const userInConversation = await this.findDetailUserByUuidConversationUseCase.execute(
          conversation.uuid,
          user.uuid,
        );
        // console.log('userInConversation: ', userInConversation);
        const lastMessage = await this.getLastMessageAndLastTimeUseCase.execute(conversation.uuid);
        // console.log('lastMessage: ', lastMessage);
        return {
          conversationUuid: conversation.uuid,
          conversationTitle: conversation.title,
          user: userInConversation,
          lastMessage: lastMessage && lastMessage.sender ? this.messageMapper.toDTO(lastMessage, user.uuid) : null,
        };
      }),
    );
    // console.log('Conversation results:', conversation);
    return new ApiSuccessResponse({
      data: conversation,
      meta: {
        total: conversations.meta.total,
        page: conversations.meta.page,
        lastPage: conversations.meta.lastPage,
      },
    });
  }
}
