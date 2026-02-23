import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { register } from 'tsconfig-paths';
import type { SeederOptions } from 'typeorm-extension';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  entities: [join(__dirname, 'dist', '**', '*.entity.orm.{ts,js}')],
  migrations: [join(__dirname, 'dist', 'shared', 'infrastructure', 'database', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  seedTracking: true,
  seeds: [join('dist/shared/infrastructure/database/seeds/*.{ts,js}')],
};

export const AppDataSource = new DataSource(option);
