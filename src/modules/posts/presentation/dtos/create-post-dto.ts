import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'Content of the post', required: true, example: 'This is my new post!' })
  @IsString()
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  content: string;
}
