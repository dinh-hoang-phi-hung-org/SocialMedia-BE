import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchDto } from '@/shared/dtos/search-dto';
import { SortDirection } from '@/shared/enum/sort-direction';
import { UserRole } from '@/shared/enum/role';
import { GetNotificationByUuidUserUseCase } from '../../application/use-cases/get-notification-by-uuid-user.use-case';
import { Roles } from '@/shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CreationNotificationUseCase } from '../../application/use-cases/creation-notification.use-case';
import { NotificationMapper } from '../../application/mapper/notification.mapper';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { NotificationResponseDto } from '../dtos/notification-response.dto';
import { ReadNotificationUseCase } from '../../application/use-cases/read-notification.use-case';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getNotificationByUuidUserUseCase: GetNotificationByUuidUserUseCase,
    private readonly notificationMapper: NotificationMapper,
    private readonly userRepository: UserRepository,
    private readonly readNotificationUseCase: ReadNotificationUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get notifications' })
  async getNotifications(
    @GetUser() user: { uuid: string },
    @Query() searchDto: SearchDto,
  ): Promise<ApiSuccessResponse<PaginatedResult<NotificationResponseDto>>> {
    const {
      searchFields,
      searchValue,
      page,
      limit,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];

    const notifications = await this.getNotificationByUuidUserUseCase.execute(user.uuid, {
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });

    const notificationsWithUserRelated = await Promise.all(
      notifications.data.map(async (notification) => {
        if (notification.userRelatedUuid) {
          const userRelated = await this.userRepository.findByUuid(notification.userRelatedUuid);
          return {
            ...notification,
            userRelated: userRelated,
          };
        }
        return notification;
      }),
    );

    return new ApiSuccessResponse(
      this.notificationMapper.toPaginatedDTO({
        data: notificationsWithUserRelated,
        meta: notifications.meta,
      }),
    );
  }

  @Post('seen/:uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @GetUser() user: { uuid: string },
    @Param('uuid') uuid: string,
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    await this.readNotificationUseCase.execute(user.uuid, uuid);
    return new ApiSuccessResponse({ message: 'Notification marked as read' });
  }
}
