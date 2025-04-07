import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FollowDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The UUID of the user to follow',
    // example: '123e4567-e89b-12d3-a456-426614174000',
  })
  followingUuid: string;
}
