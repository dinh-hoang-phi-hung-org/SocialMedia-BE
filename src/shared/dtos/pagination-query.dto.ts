export class PaginationQueryDto {
  page?: number;

  limit?: number;

  searchParams?: { [field: string]: string };

  sortParams?: { [field: string]: 'ASC' | 'DESC' };
}
