import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReactionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The UUID of the content to react to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  contentUuid: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The type of the content to react to',
    example: 'post',
  })
  contentType: 'post' | 'comment';
}
