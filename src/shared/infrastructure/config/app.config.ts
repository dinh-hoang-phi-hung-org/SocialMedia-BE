import { registerAs } from '@nestjs/config';
import { AppConfig } from './app-config.type';
import validateConfig from '@/shared/utils/validations/validate-config';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  BE_PORT: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendDomain: process.env.FRONTEND_DOMAIN || 'http://localhost:3000',
    port: process.env.BE_PORT ? parseInt(process.env.BE_PORT, 10) : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
  };
});
