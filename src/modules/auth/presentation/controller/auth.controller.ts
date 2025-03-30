import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Post('signup')
  async signup() {
    return 'Hello World';
  }
}
