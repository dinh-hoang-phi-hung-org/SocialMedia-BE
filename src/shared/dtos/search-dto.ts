import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SortDirection } from '../enum/sort-direction';

export class SearchDto {
  @ApiProperty({ description: 'Page number', required: false, example: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ description: 'Limit', required: false, example: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiProperty({
    description: 'Search fields: username, email, first_name, last_name, ...',
    required: false,
    example: 'username',
  })
  @IsOptional()
  @IsString()
  searchFields?: string;

  @ApiProperty({ description: 'Search value', required: false, example: 'admin, ...' })
  @IsOptional()
  @IsString()
  searchValue?: string;

  @ApiProperty({
    description: 'Sort by: createdAt, updatedAt, id, username, email, first_name, last_name, ...',
    required: false,
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Sort direction (ASC, DESC)', required: false, example: 'ASC' })
  @IsOptional()
  @IsString()
  sortDirection?: SortDirection;
}
