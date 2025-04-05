import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from '@/shared/infrastructure/config/app.config';
import { UsersModule } from './modules/users/users.module';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_TCP_PORT || '3306'),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
      logging: true,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname, 'shared/infrastructure/database/migrations/*.{ts,js}')],
      migrationsTableName: 'migrations',
    }),
    UsersModule,
    AuthModule,
    RedisModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      if (this.dataSource.isInitialized) {
        console.log('✅ Database connection established successfully');
      } else {
        console.error('❌ Database connection failed');
      }
    } catch (error) {
      console.error('❌ Database connection error:', error);
    }
  }
}
