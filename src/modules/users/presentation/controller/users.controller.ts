import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Patch,
  Body,
  UnauthorizedException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { Gender } from '@/shared/enum/gender';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUsersUseCase } from '@/modules/users/application/use-cases/get-users.use-case';
import { SearchDto } from '@/shared/dtos/search-dto';
import { SortDirection } from '@/shared/enum/sort-direction';
import { GetUserByUuidUseCase } from '@/modules/users/application/use-cases/get-user-by-uuid.use-case';
import { EditUserDto, UserResponseDto } from '@/modules/users/presentation/dtos/user-response.dto';
import { PaginatedResult } from '@/shared/types/paginated-result.interface';
import { UserMapper } from '@/modules/users/application/mapper/user.mapper';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enum/role';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { GetMeUseCase } from '@/modules/users/application/use-cases/get-me.use-case';
import { GetUserWithoutMeUseCase } from '@/modules/users/application/use-cases/get-user-without-me.use-case';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { EditUserUseCase } from '@/modules/users/application/use-cases/edit-user.use-case';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from '@/modules/storage/storage.service';
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByUuidUseCase: GetUserByUuidUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly getUserWithoutMeUseCase: GetUserWithoutMeUseCase,
    private readonly editUserUseCase: EditUserUseCase,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  async getUsers(
    @Query() searchDto: SearchDto,
    @GetUser() currentUser: { uuid: string; role: UserRole },
  ): Promise<ApiSuccessResponse<PaginatedResult<UserResponseDto>>> {
    const {
      searchFields,
      searchValue,
      page,
      limit,
      sortBy = 'createdAt',
      sortDirection = SortDirection.DESC,
    } = searchDto;
    const searchFieldsArray = searchFields ? searchFields.split(',').map((field) => field.trim()) : [];
    // console.log(searchFieldsArray);
    let result: PaginatedResult<UserOrmEntity>;
    if (currentUser.role === UserRole.USER) {
      result = await this.getUserWithoutMeUseCase.execute(currentUser.uuid, {
        searchFields: searchFieldsArray,
        searchValue,
        page,
        limit,
        sortBy,
        sortDirection: sortDirection as SortDirection,
      });
    } else {
      result = await this.getUsersUseCase.execute({
        searchFields: searchFieldsArray,
        searchValue,
        page,
        limit,
        sortBy,
        sortDirection: sortDirection as SortDirection,
      });
    }

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

  @Patch(':uuid')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        uuid: {
          type: 'string',
          description: 'User UUID',
        },
        username: {
          type: 'string',
          description: 'Username',
        },
        firstName: {
          type: 'string',
          description: 'First name',
        },
        lastName: {
          type: 'string',
          description: 'Last name',
        },
        bio: {
          type: 'string',
          description: 'Bio',
        },
        profilePictureUrl: {
          type: 'string',
          description: 'Profile picture URL',
          format: 'binary',
        },
        dateOfBirth: {
          type: 'string',
          description: 'Date of birth',
        },
        gender: {
          type: 'boolean',
          description: 'Gender',
        },
      },
      required: [],
    },
  })
  @UseInterceptors(FilesInterceptor('profilePictureUrl', 1))
  async editUser(
    @Param('uuid') uuid: string,
    @GetUser() currentUser: { uuid: string },
    @Body() body: any,
    @UploadedFiles() files: any[],
  ): Promise<ApiSuccessResponse<UserResponseDto>> {
    if (currentUser.uuid !== uuid) {
      throw new UnauthorizedException('You are not allowed to edit this user');
    }

    const editUserDto = new EditUserDto();
    editUserDto.uuid = uuid;

    if (body.username && body.username.trim() !== '') {
      editUserDto.username = body.username.trim();
    }

    if (body.firstName && body.firstName.trim() !== '') {
      editUserDto.firstName = body.firstName.trim();
    }

    if (body.lastName && body.lastName.trim() !== '') {
      editUserDto.lastName = body.lastName.trim();
    }

    if (body.bio !== undefined) {
      editUserDto.bio = body.bio.trim();
    }

    if (body.gender && body.gender !== '') {
      if (body.gender === 'true' || body.gender === 'male' || body.gender === Gender.MALE) {
        editUserDto.gender = Gender.MALE;
      } else if (body.gender === 'false' || body.gender === 'female' || body.gender === Gender.FEMALE) {
        editUserDto.gender = Gender.FEMALE;
      }
    }

    if (body.dateOfBirth && body.dateOfBirth !== '') {
      editUserDto.dateOfBirth = new Date(body.dateOfBirth);
    }

    if (files && files.length > 0) {
      const file = files[0];
      const uploadPath = `users/${editUserDto.uuid}`;
      const mediaFiles = await this.storageService.uploadFile(file, uploadPath);
      editUserDto.profilePictureUrl = mediaFiles;
      console.log('File uploaded:', file.originalname);
    }

    const user = await this.editUserUseCase.execute(editUserDto);
    return new ApiSuccessResponse(this.userMapper.toDTO(user));
  }
}
