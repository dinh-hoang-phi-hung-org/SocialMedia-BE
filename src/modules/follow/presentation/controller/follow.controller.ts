import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enum/role';
import { FollowDto } from '@/modules/follow/presentation/dtos/follow.dto';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { FollowUserUseCase } from '@/modules/follow/application/use-cases/follow-user.use-case';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { SearchDto } from '@/shared/dtos/search-dto';
import { UserResponseDto } from '@/modules/users/presentation/dtos/user-response.dto';
import { SortDirection } from '@/shared/enum/sort-direction';
import { GetFollowersListUseCase } from '@/modules/follow/application/use-cases/get-followers-list.use-case';
import { UnfollowUserUseCase } from '@/modules/follow/application/use-cases/unfollow-user.use-case';
import { GetFollowingsListUseCase } from '@/modules/follow/application/use-cases/get-followings-list.use-case';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { AdjustUserFollowerCountUseCase } from '@/modules/follow/application/use-cases/adjust-user-follower-count.use-case';
import { AdjustUserFollowingCountUseCase } from '@/modules/follow/application/use-cases/adjust-user-following-count.use-case';

@ApiTags('Follow')
@Controller('follow')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowController {
  constructor(
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly unfollowUserUseCase: UnfollowUserUseCase,
    private readonly getFollowersListUseCase: GetFollowersListUseCase,
    private readonly getFollowingsListUseCase: GetFollowingsListUseCase,
    private readonly userMapper: UserMapper,
    private readonly adjustUserFollowingCountUseCase: AdjustUserFollowingCountUseCase,
    private readonly adjustUserFollowerCountUseCase: AdjustUserFollowerCountUseCase,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Follow a user' })
  async followUser(
    @GetUser() currentUser: { uuid: string },
    @Body() body: FollowDto,
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    const { followingUuid } = body;
    await this.followUserUseCase.execute(currentUser.uuid, followingUuid);
    await this.adjustUserFollowingCountUseCase.execute(currentUser.uuid, true);
    await this.adjustUserFollowerCountUseCase.execute(followingUuid, true);
    return new ApiSuccessResponse({
      message: 'User followed successfully',
    });
  }

  @Delete()
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollowUser(
    @GetUser() currentUser: { uuid: string },
    @Body() body: FollowDto,
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    const { followingUuid } = body;
    await this.unfollowUserUseCase.execute(currentUser.uuid, followingUuid);
    await this.adjustUserFollowingCountUseCase.execute(currentUser.uuid, false);
    await this.adjustUserFollowerCountUseCase.execute(followingUuid, false);
    return new ApiSuccessResponse({
      message: 'User unfollowed successfully',
    });
  }

  @Get('/followers/:uuid')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get followers of a user' })
  async getFollowersList(
    @Param('uuid') uuid: string,
    @Query() searchDto: SearchDto,
  ): Promise<ApiSuccessResponse<PaginatedResult<UserResponseDto>>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];
    const result = await this.getFollowersListUseCase.execute(uuid, {
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });
    return new ApiSuccessResponse(this.userMapper.toPaginatedDTO(result));
  }

  @Get('/following/:uuid')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get following of a user' })
  async getFollowingList(
    @Param('uuid') uuid: string,
    @Query() searchDto: SearchDto,
  ): Promise<ApiSuccessResponse<PaginatedResult<UserResponseDto>>> {
    const { searchFields, searchValue, page, limit, sortBy, sortDirection } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];
    const result = await this.getFollowingsListUseCase.execute(uuid, {
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });
    return new ApiSuccessResponse(this.userMapper.toPaginatedDTO(result));
  }
}
