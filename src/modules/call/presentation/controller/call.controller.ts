import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CallService } from '@/modules/call/application/call.service';
import { CreateLiveKitTokenDto } from '@/modules/call/presentation/dtos/create-livekit-token.dto';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

type LiveKitTokenResponse = {
  token: string;
  url: string;
  roomName: string;
};

@ApiTags('Call')
@Controller('call')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post('livekit-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create LiveKit token for voice and video calls' })
  async createLiveKitToken(
    @Body() body: CreateLiveKitTokenDto,
    @GetUser() user: { uuid: string; username?: string },
  ): Promise<ApiSuccessResponse<LiveKitTokenResponse>> {
    return new ApiSuccessResponse(
      await this.callService.createLiveKitToken(body.roomName, user, body.displayName),
    );
  }
}
