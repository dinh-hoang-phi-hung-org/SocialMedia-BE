import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLiveKitTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  roomName: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  displayName?: string;
}
