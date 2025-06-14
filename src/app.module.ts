import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from '@/shared/infrastructure/config/app.config';
import { UsersModule } from './modules/users/users.module';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { FollowModule } from './modules/follow/follow.module';
import { StorageModule } from './modules/storage/storage.module';
import { PostsModule } from './modules/posts/posts.module';
import { MessageModule } from './modules/message/message.module';
import { SocketModule } from './modules/socket/socket.module';
import { CommentModule } from './modules/comment/comment.module';
import { ReportModule } from './modules/report/report.module';
import { ReactionsModule } from './modules/reactions/reactions.module';

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
      entities: [join(__dirname, '**', '*.entity.orm.{ts,js}')],
      migrations: [join(__dirname, 'shared/infrastructure/database/migrations/*.{ts,js}')],
      migrationsTableName: 'migrations',
    }),
    UsersModule,
    AuthModule,
    RedisModule,
    FollowModule,
    PostsModule,
    MessageModule,
    SocketModule,
    StorageModule,
    CommentModule,
    ReportModule,
    ReactionsModule,
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
