import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The UUID of the content to report' })
  contentUuid: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The type of content to report' })
  contentType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The details of the report' })
  details: string;
}
