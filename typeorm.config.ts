import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { register } from 'tsconfig-paths';

register({
  baseUrl: './src',
  paths: {
    '@/*': ['*'],
  },
});

dotenv.config();

const root = join(__dirname);

export default new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_TCP_PORT || '3306'),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [join(root, 'src', '**', '*.entity.orm.{ts,js}')],
  migrations: [join(root, 'src', 'shared', 'infrastructure', 'database', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
});
