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
  Delete,
  Param,
  NotFoundException,
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
import { GetConversationByUuidUseCase } from '@/modules/message/application/use-cases/get-conversation-by-uuid.use-case';
import { SeenMessageRepository } from '@/modules/message/infrastructure/repositories/seen-message.repository';
import { SeenMessageConversationUseCase } from '@/modules/message/application/use-cases/seen-message-conversation.use-case';
import { UpdateConversationUseCase } from '@/modules/message/application/use-cases/update-conversation.use-case';
import { RemoveMemberFromConversationUseCase } from '../../application/use-cases/remove-member-from-conversation.use-case';
import { AddMemberIntoConversationUseCase } from '../../application/use-cases/add-member-into-conversation.use-case';
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
    private readonly getConversationByUuidUseCase: GetConversationByUuidUseCase,
    private readonly seenMessageRepository: SeenMessageRepository,
    private readonly seenMessageConversationUseCase: SeenMessageConversationUseCase,
    private readonly updateConversationUseCase: UpdateConversationUseCase,
    private readonly removeMemberFromConversationUseCase: RemoveMemberFromConversationUseCase,
    private readonly addMemberIntoConversationUseCase: AddMemberIntoConversationUseCase,
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
        type: {
          type: 'string',
          description: 'Type of message',
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
      messageDto.type,
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
    @Query('conversationUuid') conversationUuid: string,
    @Query() searchDto: SearchDto,
  ): Promise<
    ApiSuccessResponse<{
      conversation: ConversationResponseDto;
      messages: PaginatedResult<MessageResponseDto>;
    }>
  > {
    const receiver = await this.userRepository.findByUuid(receiverUuid);
    const conversation = conversationUuid
      ? await this.getConversationByUuidUseCase.execute(conversationUuid)
      : await this.findUuidConversationUseCase.execute(user.uuid, receiverUuid);
    if (!conversation) {
      return new ApiSuccessResponse({
        conversation: {
          conversationUuid: '',
          conversationTitle: receiver.username,
          conversationUrl: receiver.profile_picture_url,
          isGroupChat: false,
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

    const lastMessage = await this.getLastMessageAndLastTimeUseCase.execute(conversation.uuid);
    const isSeen = lastMessage ? await this.seenMessageRepository.checkSeenMessage(lastMessage.uuid, user.uuid) : false;
    if (lastMessage && !isSeen) {
      await this.seenMessageConversationUseCase.execute(lastMessage.uuid, user.uuid);
    }

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
        conversationUrl: conversation.isGroupChat ? conversation.groupPictureUrl : receiver.profile_picture_url,
        isGroupChat: conversation.isGroupChat,
        adminUuid: conversation.adminUuid,
        users:
          conversation.participants?.map((participant) => ({
            uuid: participant.user.uuid,
            username: participant.user.username,
            profilePictureUrl: participant.user.profile_picture_url,
          })) || [],
      },
      messages: this.messageMapper.toPaginatedDTO(history, user.uuid),
    });
  }

  @Post('conversation/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new group conversation' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Group chat title',
        },
        participantUuids: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Array of participant UUIDs',
        },
        groupPictureUrl: {
          type: 'string',
          description: 'Group picture URL',
          format: 'binary',
        },
      },
      required: ['title', 'participantUuids'],
    },
  })
  @UseInterceptors(FilesInterceptor('groupPictureUrl', 1))
  async createGroupConversation(
    @GetUser() user: { uuid: string },
    @Body() createGroupDto: { title: string; participantUuids: string | string[] },
    @UploadedFiles(
      new ParseFilePipeBuilder().addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 }).build({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        fileIsRequired: false,
      }),
    ) // eslint-disable-next-line @typescript-eslint/no-explicit-any
    files: Array<any>,
  ): Promise<
    ApiSuccessResponse<{ conversationUuid: string; message: string }> | ApiFailureResponse<{ message: string }>
  > {
    try {
      const participantUuids = Array.isArray(createGroupDto.participantUuids)
        ? createGroupDto.participantUuids
        : [createGroupDto.participantUuids];

      if (!participantUuids || participantUuids.length === 0) {
        return new ApiFailureResponse(['At least one participant is required']);
      }

      // Check if all participants exist
      await Promise.all(
        participantUuids.map(async (uuid) => {
          const participant = await this.userRepository.findByUuid(uuid);
          if (!participant) {
            throw new BadRequestException(`User with UUID ${uuid} not found`);
          }
          return participant;
        }),
      );

      const conversation = await this.createConversationUseCase.execute(true, createGroupDto.title, user.uuid);

      if (files && files.length > 0 && files[0]) {
        const uploadPath = `conversations/${conversation.uuid}`;
        const mediaFiles = await this.storageService.uploadFile(files[0], uploadPath);
        conversation.groupPictureUrl = mediaFiles;
        await this.updateConversationUseCase.execute({
          conversationUuid: conversation.uuid,
          conversationGroupPictureUrl: mediaFiles,
        });
      }

      await this.createUserConversationUseCase.execute(conversation.uuid, user.uuid);

      await Promise.all(
        participantUuids.map(async (participantUuid) => {
          await this.createUserConversationUseCase.execute(conversation.uuid, participantUuid);
        }),
      );

      return new ApiSuccessResponse({
        conversationUuid: conversation.uuid,
        message: 'Group conversation created successfully',
      });
    } catch (error) {
      console.error('Error creating group conversation:', error);
      return new ApiFailureResponse([error.message || 'Failed to create group conversation']);
    }
  }

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
    console.log('conversations: ', conversations);
    const conversation = await Promise.all(
      conversations.data.map(async (conversation) => {
        const lastMessage = await this.getLastMessageAndLastTimeUseCase.execute(conversation.uuid);
        const isSeen = lastMessage
          ? await this.seenMessageRepository.checkSeenMessage(lastMessage.uuid, user.uuid)
          : false;
        if (conversation.isGroupChat) {
          return {
            conversationUuid: conversation.uuid,
            conversationTitle: conversation.title,
            conversationUrl: conversation.groupPictureUrl,
            users:
              conversation.participants?.map((participant) => ({
                uuid: participant.user.uuid,
                username: participant.user.username,
                profilePictureUrl: participant.user.profile_picture_url,
              })) || [],
            lastMessage:
              lastMessage && lastMessage.sender ? this.messageMapper.toDTO(lastMessage, user.uuid, isSeen) : null,
            isGroupChat: true,
          };
        }
        const userInConversation = await this.findDetailUserByUuidConversationUseCase.execute(
          conversation.uuid,
          user.uuid,
        );
        return {
          conversationUuid: conversation.uuid,
          conversationTitle: conversation.title,
          conversationUrl: userInConversation.profilePictureUrl,
          user: userInConversation,
          lastMessage:
            lastMessage && lastMessage.sender ? this.messageMapper.toDTO(lastMessage, user.uuid, isSeen) : null,
          isGroupChat: false,
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

  @Post('conversation/seen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark a message as seen' })
  async markMessageAsSeen(@GetUser() user: { uuid: string }, @Query('messageUuid') messageUuid: string) {
    return this.seenMessageConversationUseCase.execute(messageUuid, user.uuid);
  }

  @Delete('conversation/remove-members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove a member from group conversation (Admin only)' })
  async removeMemberFromConversation(
    @GetUser() user: { uuid: string },
    @Body() removeMemberDto: { conversationUuid: string; memberUuid: string },
  ) {
    const conversation = await this.getConversationByUuidUseCase.execute(removeMemberDto.conversationUuid);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.isGroupChat) {
      throw new BadRequestException('This is not a group conversation');
    }

    if (conversation.adminUuid !== user.uuid) {
      throw new BadRequestException('You are not the admin of this group');
    }

    if (removeMemberDto.memberUuid === user.uuid) {
      throw new BadRequestException('Admin cannot remove themselves. Transfer admin rights first or delete the group');
    }

    await this.removeMemberFromConversationUseCase.execute(
      removeMemberDto.conversationUuid,
      removeMemberDto.memberUuid,
    );

    return new ApiSuccessResponse({
      message: 'Member removed from conversation successfully',
    });
  }

  @Delete('conversation/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Leave a group conversation' })
  async leaveConversation(@GetUser() user: { uuid: string }, @Body() leaveDto: { conversationUuid: string }) {
    const conversation = await this.getConversationByUuidUseCase.execute(leaveDto.conversationUuid);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.isGroupChat) {
      throw new BadRequestException('This is not a group conversation');
    }

    if (conversation.adminUuid === user.uuid) {
      throw new BadRequestException('Admin cannot leave the group. Transfer admin rights first or delete the group');
    }

    await this.removeMemberFromConversationUseCase.execute(leaveDto.conversationUuid, user.uuid);

    return new ApiSuccessResponse({
      message: 'You have left the conversation successfully',
    });
  }

  @Post('conversation/add-members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a user to a conversation' })
  async addUserToConversation(
    @GetUser() user: { uuid: string },
    @Body() addMembersDto: { conversationUuid: string; participantUuids: string[] },
  ) {
    const conversation = await this.getConversationByUuidUseCase.execute(addMembersDto.conversationUuid);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.isGroupChat) {
      if (conversation.adminUuid !== user.uuid) {
        throw new BadRequestException('You are not the admin of this group');
      } else {
        await this.addMemberIntoConversationUseCase.execute(
          addMembersDto.conversationUuid,
          addMembersDto.participantUuids,
        );
        return new ApiSuccessResponse({
          message: 'User added to conversation successfully',
        });
      }
    }
  }
}
