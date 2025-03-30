import { IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';
import { SortDirection } from '../enum/sort-direction';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  sortBy?: string;

  @ValidateIf((dto) => dto.orderBy !== null && dto.orderBy !== undefined && dto.orderBy !== '')
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;

  @IsOptional()
  searchBy?: string;

  @ValidateIf((dto) => dto.searchBy !== null && dto.searchBy !== undefined && dto.searchBy !== '')
  @IsOptional()
  @IsString()
  searchValue?: string;
}
