import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { SignupDto } from '@/modules/auth/presentation/dtos/signup.dto';
import { UserRepository } from '@/modules/users/infrastructure/repositories/user.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRole } from '@/shared/enum/role';
import { MailService } from '@/modules/mail/mail.service';
import { GenerateVerificationTokenUseCase } from './generate-verification-token.use-case';
import { hashPassword } from '@/shared/helpers/bcrypt';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly generateVerificationTokenUseCase: GenerateVerificationTokenUseCase,
  ) {}

  async execute(signupDto: SignupDto): Promise<{ message: string }> {
    const existingEmail = await this.userRepository.findByEmail(signupDto.email);
    if (existingEmail) {
      throw new BadRequestException('common:auth.email-already-exists');
    }

    const existingUsername = await this.userRepository.findByUsername(signupDto.username);
    if (existingUsername) {
      throw new BadRequestException('common:auth.username-already-exists');
    }

    const hashedPassword = await hashPassword(signupDto.password);

    const user = new UserOrmEntity();
    user.username = signupDto.username;
    user.email = signupDto.email;
    user.password_hash = hashedPassword;
    user.role = UserRole.USER;
    user.is_active = false;
    user.createdAt = new Date();

    const createdUser = await this.userRepository.create(user);

    const verificationToken = await this.generateVerificationTokenUseCase.execute(createdUser);

    await this.mailService.sendUserConfirmation(createdUser, verificationToken);

    return {
      message: 'common:message.register-success',
    };
  }
}
