import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AllConfigType } from '@/shared/infrastructure/config/config.type';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    const configService = app.get(ConfigService<AllConfigType>);

    app.enableCors({
      origin: configService.getOrThrow('app.frontendDomain', { infer: true }),
      credentials: true,
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
        },
        'access-token',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.listen(configService.getOrThrow('app.port', { infer: true }));
    console.log(`Server is running on port ${configService.getOrThrow('app.port', { infer: true })}`);
  } catch (error) {
    console.error('Error during application bootstrap:', error);
    process.exit(1);
  }
}
bootstrap();
