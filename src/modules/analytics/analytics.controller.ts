import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService, AnalyticsData, DashboardStats } from './analytics.service';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enum/role';
import { ApiSuccessResponse } from '@/shared/dtos/api-response.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('users-registration')
  async getUsersRegistrationStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
  ): Promise<ApiSuccessResponse<AnalyticsData[]>> {
    return new ApiSuccessResponse(
      await this.analyticsService.getUsersRegistrationStats(new Date(startDate), new Date(endDate), period),
    );
  }

  @Get('posts-creation')
  async getPostsCreationStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
  ): Promise<ApiSuccessResponse<AnalyticsData[]>> {
    return new ApiSuccessResponse(
      await this.analyticsService.getPostsCreationStats(new Date(startDate), new Date(endDate), period),
    );
  }

  @Get('reports')
  async getReportsStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
  ): Promise<ApiSuccessResponse<AnalyticsData[]>> {
    return new ApiSuccessResponse(
      await this.analyticsService.getReportsStats(new Date(startDate), new Date(endDate), period),
    );
  }

  @Get('dashboard')
  async getDashboardStats(): Promise<ApiSuccessResponse<DashboardStats>> {
    return new ApiSuccessResponse(await this.analyticsService.getDashboardStats());
  }
}
