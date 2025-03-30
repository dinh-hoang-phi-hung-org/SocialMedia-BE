import { BadRequestException } from '@nestjs/common';
import { FindOptionsWhere, Like, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export abstract class AbstractRepository<T extends ObjectLiteral> {
  constructor(
    protected readonly options: {
      searchableFields: string[];
      sortableFields: string[];
    },
  ) {}

  protected validateSearchFields(fields: string[]): void {
    const invalidFields = fields.filter((field) => !this.options.searchableFields.includes(field));
    if (invalidFields.length > 0) {
      throw new BadRequestException(`Invalid search fields: ${invalidFields.join(', ')}`);
    }
  }

  protected validateSortFields(field: string): void {
    if (!this.options.sortableFields.includes(field)) {
      throw new BadRequestException(`Invalid sort field: ${field}`);
    }
  }

  protected buildWhereConditions(searchFields: string[], searchValue: string): FindOptionsWhere<T>[] {
    const where: FindOptionsWhere<T>[] = [];

    const fieldsToSearch = searchFields.length > 0 ? searchFields : this.options.searchableFields;
    fieldsToSearch.forEach((field) => {
      const condition = {};
      condition[field] = Like(`%${searchValue}%`);
      where.push(condition);
    });
    return where;
  }

  public camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  public applySearchParams(
    queryBuilder: SelectQueryBuilder<T>,
    searchParams: Record<string, any>,
  ): SelectQueryBuilder<T> {
    for (const [key, value] of Object.entries(searchParams)) {
      const snakeCaseKey = this.camelToSnakeCase(key);
      queryBuilder.andWhere(`${snakeCaseKey} LIKE :${key}`, {
        [key]: `%${value}%`,
      });
    }
    return queryBuilder;
  }

  public applySortParams(queryBuilder: SelectQueryBuilder<T>, sortParams: Record<string, any>): SelectQueryBuilder<T> {
    Object.entries(sortParams).forEach(([key, direction]) => {
      const snakeCaseKey = this.camelToSnakeCase(key);
      queryBuilder.orderBy(`${snakeCaseKey}`, direction);
    });
    return queryBuilder;
  }
}
