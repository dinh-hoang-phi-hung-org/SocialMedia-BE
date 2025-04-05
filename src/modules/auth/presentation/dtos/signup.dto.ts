import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({ description: 'Username', required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Email', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password', required: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Confirm password', required: true })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
