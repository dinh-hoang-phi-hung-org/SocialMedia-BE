import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUsersUseCase } from '@/modules/users/application/use-cases/get-users.use-case';
import { SearchDto } from '@/shared/dtos/search-dto';
import { SortDirection } from '@/shared/enum/sort-direction';
import { GetUserByUuidUseCase } from '@/modules/users/application/use-cases/get-user-by-uuid.use-case';
import { UserResponseDto } from '@/modules/users/presentation/dtos/user-response.dto';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enum/role';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { GetMeUseCase } from '@/modules/users/application/use-cases/get-me.use-case';
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByUuidUseCase: GetUserByUuidUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Get()
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  async getUsers(@Query() searchDto: SearchDto): Promise<ApiSuccessResponse<PaginatedResult<UserResponseDto>>> {
    const {
      searchFields,
      searchValue,
      page,
      limit,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];
    console.log(searchFieldsArray);
    const result = await this.getUsersUseCase.execute({
      searchFields: searchFieldsArray,
      searchValue,
      page,
      limit,
      sortBy,
      sortDirection: sortDirection as SortDirection,
    });

    return new ApiSuccessResponse(this.userMapper.toPaginatedDTO(result));
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@GetUser() currentUser: { uuid: string }): Promise<ApiSuccessResponse<UserResponseDto>> {
    const user = await this.getMeUseCase.execute(currentUser.uuid);
    return new ApiSuccessResponse(this.userMapper.toDTO(user));
  }

  @Get(':uuid')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get user by UUID' })
  async getUserByUuid(
    @Param('uuid') uuid: string,
    @GetUser() currentUser: { uuid: string },
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    const user = await this.getUserByUuidUseCase.execute(uuid, currentUser.uuid);
    return new ApiSuccessResponse(this.userMapper.toDTO(user, user.isFollowed));
  }
}
