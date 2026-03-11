import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import type { SeederOptions } from 'typeorm-extension';

dotenv.config();

const option: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_TCP_PORT || '3306'),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [join(__dirname, '**', '*.entity.orm.{js,ts}')],
  migrations: [join(__dirname, 'shared/infrastructure/database/migrations/*.js')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  seedTracking: true,
  seeds: [join(__dirname, 'shared/infrastructure/database/seeds/*.{js,ts}')],
};

export default new DataSource(option);
