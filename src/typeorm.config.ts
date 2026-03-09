import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { register } from 'tsconfig-paths';
import type { SeederOptions } from 'typeorm-extension';

register({
  baseUrl: './src',
  paths: {
    '@/*': ['*'],
  },
});

dotenv.config();

const option: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_TCP_PORT || '3306'),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [join('dist', '**', '*.entity.orm.js')],
  migrations: [join('dist', 'shared', 'infrastructure', 'database', 'migrations', '*.js')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  seedTracking: true,
  seeds: [join('dist', 'shared', 'infrastructure', 'database', 'seeds', '*.js')],
};

export default new DataSource(option);
