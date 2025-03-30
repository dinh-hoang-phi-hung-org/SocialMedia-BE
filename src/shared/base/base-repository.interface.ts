import { PaginatedResult } from '../types/paginated-result.interface';
import { SearchOptions } from '../types/search-options';

export interface IBaseRepository<T> {
  create(entity: T): Promise<T>;
  findAll(query: SearchOptions): Promise<PaginatedResult<T>>;
  findByUuid(uuid: string): Promise<T>;
  findById(id: number): Promise<T>;
  update(uuid: string, entity: T): Promise<T>;
  delete(uuid: string): Promise<void>;
}
