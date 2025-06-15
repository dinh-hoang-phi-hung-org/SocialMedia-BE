import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/orm/users.entity.orm';
import { PostOrmEntity } from '@/modules/posts/infrastructure/orm/posts.entity.orm';
import { ReportOrmEntity } from '@/modules/report/infrastructure/orm/report.entity.orm';

export interface AnalyticsData {
  date: string;
  count: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalReports: number;
  pendingReports: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserOrmEntity)
    private userRepository: Repository<UserOrmEntity>,
    @InjectRepository(PostOrmEntity)
    private postRepository: Repository<PostOrmEntity>,
    @InjectRepository(ReportOrmEntity)
    private reportRepository: Repository<ReportOrmEntity>,
  ) {}

  async getUsersRegistrationStats(
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month',
  ): Promise<AnalyticsData[]> {
    const dateFormat = this.getDateFormat(period);

    const query = this.userRepository
      .createQueryBuilder('user')
      .select(`DATE_FORMAT(user.created_at, '${dateFormat}') as date`)
      .addSelect('COUNT(*) as count')
      .where('user.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .groupBy('date')
      .orderBy('date', 'ASC');

    const result = await query.getRawMany();
    const data = result.map((item) => ({
      date: this.formatDateForPeriod(item.date, period),
      count: parseInt(item.count),
    }));

    return this.fillMissingDates(data, startDate, endDate, period);
  }

  async getPostsCreationStats(
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month',
  ): Promise<AnalyticsData[]> {
    const dateFormat = this.getDateFormat(period);

    const query = this.postRepository
      .createQueryBuilder('post')
      .select(`DATE_FORMAT(post.created_at, '${dateFormat}') as date`)
      .addSelect('COUNT(*) as count')
      .where('post.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('post.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('date')
      .orderBy('date', 'ASC');

    const result = await query.getRawMany();
    const data = result.map((item) => ({
      date: this.formatDateForPeriod(item.date, period),
      count: parseInt(item.count),
    }));

    return this.fillMissingDates(data, startDate, endDate, period);
  }

  async getReportsStats(startDate: Date, endDate: Date, period: 'day' | 'week' | 'month'): Promise<AnalyticsData[]> {
    const dateFormat = this.getDateFormat(period);

    const query = this.reportRepository
      .createQueryBuilder('report')
      .select(`DATE_FORMAT(report.created_at, '${dateFormat}') as date`)
      .addSelect('COUNT(*) as count')
      .where('report.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('date')
      .orderBy('date', 'ASC');

    const result = await query.getRawMany();
    const data = result.map((item) => ({
      date: this.formatDateForPeriod(item.date, period),
      count: parseInt(item.count),
    }));

    return this.fillMissingDates(data, startDate, endDate, period);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalUsers, activeUsers, totalPosts, totalReports, pendingReports] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { is_active: true } }),
      this.postRepository.count({ where: { isDeleted: false } }),
      this.reportRepository.count(),
      this.reportRepository.count({ where: { status: 'pending' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalPosts,
      totalReports,
      pendingReports,
    };
  }

  private getDateFormat(period: 'day' | 'week' | 'month'): string {
    switch (period) {
      case 'day':
        return '%Y-%m-%d';
      case 'week':
        return '%Y-%m-%d'; // Use first day of week instead
      case 'month':
        return '%Y-%m-01'; // Use first day of month
      default:
        return '%Y-%m-%d';
    }
  }

  private formatDateForPeriod(date: string, period: 'day' | 'week' | 'month'): string {
    const parsedDate = new Date(date);

    switch (period) {
      case 'day':
        return parsedDate.toISOString().split('T')[0];
      case 'week':
        // Get the Monday of the week
        const dayOfWeek = parsedDate.getDay();
        const monday = new Date(parsedDate);
        monday.setDate(parsedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        return monday.toISOString().split('T')[0];
      case 'month':
        return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-01`;
      default:
        return parsedDate.toISOString().split('T')[0];
    }
  }

  private fillMissingDates(
    data: AnalyticsData[],
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month',
  ): AnalyticsData[] {
    const result: AnalyticsData[] = [];
    const dataMap = new Map(data.map((item) => [item.date, item.count]));

    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = this.formatDateForPeriod(current.toISOString(), period);

      if (!result.find((item) => item.date === dateStr)) {
        result.push({
          date: dateStr,
          count: dataMap.get(dateStr) || 0,
        });
      }

      // Increment date based on period
      switch (period) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }
}
