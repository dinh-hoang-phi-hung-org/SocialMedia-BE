import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReactionDto } from '@/modules/reactions/presentation/dtos/create-reaction.dto';
import { CreateReactionUseCase } from '@/modules/reactions/application/usecases/create-reaction.use-case';
import { GetUser } from '@/shared/decorators/get-user.decorator';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enum/role';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';
import { DeleteReactionUseCase } from '@/modules/reactions/application/usecases/delete-reaction.use-case';

@ApiTags('Reactions')
@Controller('reactions')
export class ReactionController {
  constructor(
    private readonly createReactionUseCase: CreateReactionUseCase,
    private readonly deleteReactionUseCase: DeleteReactionUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Create a new reaction' })
  async createReaction(
    @Body() createReactionDto: CreateReactionDto,
    @GetUser() user: { uuid: string },
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    await this.createReactionUseCase.execute(createReactionDto, user.uuid);
    return new ApiSuccessResponse({ message: 'Reaction created successfully' });
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Delete a reaction' })
  async deleteReaction(
    @Body() deleteReactionDto: CreateReactionDto,
    @GetUser() user: { uuid: string },
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    await this.deleteReactionUseCase.execute(deleteReactionDto, user.uuid);
    return new ApiSuccessResponse({ message: 'Reaction deleted successfully' });
  }
}
