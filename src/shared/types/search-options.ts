import { SortDirection } from '../enum/sort-direction';

export interface SearchOptions {
  searchFields?: string[];
  searchValue?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
