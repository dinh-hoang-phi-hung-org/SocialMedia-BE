import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AllConfigType } from '@/shared/infrastructure/config/config.type';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    const configService = app.get(ConfigService<AllConfigType>);

    const publicPath = join(process.cwd(), 'public');
    console.log('Serving static files from:', publicPath);
    app.useStaticAssets(publicPath);

    app.useWebSocketAdapter(new IoAdapter(app));

    // const frontendDomain = configService.get('app.frontendDomain', { infer: true }) || 'http://localhost:3000';

    app.enableCors({
      origin: true, // Temporarily allow all origins for debugging
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'X-File-Name',
      ],
      optionsSuccessStatus: 200,
      preflightContinue: false,
    });

    app.use('/api/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    app
      .enableShutdownHooks()
      .useGlobalPipes(new ValidationPipe())
      .enableVersioning({
        type: VersioningType.URI,
      })
      .setGlobalPrefix(configService.getOrThrow('app.apiPrefix', { infer: true }), {
        exclude: ['/'],
      });

    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
          name: 'Authorization',
        },
        'access-token',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.listen(configService.getOrThrow('app.port', { infer: true }));
    console.log(`Server is running on port ${configService.getOrThrow('app.port', { infer: true })}`);
    console.log(`WebSocket server is running on namespace: /chat`);
    console.log(
      `Chat client available at: http://localhost:${configService.getOrThrow('app.port', { infer: true })}/modern-chat-client.html`,
    );
  } catch (error) {
    console.error('Error during application bootstrap:', error);
    process.exit(1);
  }
}
bootstrap();
