import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { EditUserDto } from '@/modules/users/presentation/dtos/user-response.dto';

@Injectable()
export class EditUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(editUserDto: EditUserDto): Promise<UserOrmEntity> {
    // Mapping từ DTO fields (camelCase) sang Entity fields (snake_case)
    const fieldMapping: Record<keyof EditUserDto, keyof UserOrmEntity> = {
      uuid: 'uuid',
      username: 'username',
      email: 'email',
      firstName: 'first_name',
      lastName: 'last_name',
      profilePictureUrl: 'profile_picture_url',
      bio: 'bio',
      gender: 'gender',
      dateOfBirth: 'date_of_birth',
    };

    const updateData: Partial<UserOrmEntity> = {};

    Object.keys(fieldMapping).forEach((dtoField) => {
      const dtoKey = dtoField as keyof EditUserDto;
      const entityKey = fieldMapping[dtoKey];
      const value = editUserDto[dtoKey];

      if (dtoKey !== 'uuid' && value !== undefined && value !== null) {
        (updateData as any)[entityKey] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return await this.userRepository.findByUuid(editUserDto.uuid);
    }

    const user = await this.userRepository.update(editUserDto.uuid, updateData);
    return user;
  }
}
