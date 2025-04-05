import { LoginDto } from '@/modules/auth/presentation/dtos/login.dto';
import { Controller, Post, Body, BadRequestException, Get, Query, UseGuards } from '@nestjs/common';
import { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case';
import { SignupDto } from '@/modules/auth/presentation/dtos/signup.dto';
import { SignupUseCase } from '@/modules/auth/application/use-cases/signup.use-case';
import { VerifyEmailUseCase } from '@/modules/auth/application/use-cases/verify-email.use-case';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-case';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly signupUseCase: SignupUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() body: LoginDto) {
    return this.loginUseCase.execute(body);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register new user' })
  async signup(@Body() body: SignupDto) {
    if (body.password !== body.confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }
    return this.signupUseCase.execute(body);
  }

  @Get('confirm')
  @ApiOperation({ summary: 'Confirm email address' })
  async confirmEmail(@Query('token') token: string): Promise<ApiSuccessResponse<{ message: string }>> {
    await this.verifyEmailUseCase.execute(token);

    return new ApiSuccessResponse({
      message: 'Email verified successfully. You can now login to your account.',
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@GetUser('token') token: string): Promise<ApiSuccessResponse<{ message: string }>> {
    return this.logoutUseCase.execute(token);
  }
}
