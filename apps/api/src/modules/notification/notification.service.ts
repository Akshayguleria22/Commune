import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities';
import { PaginationDto, PaginatedResponseDto } from '../../shared/dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async create(userId: string, type: string, title: string, message?: string, data?: Record<string, any>): Promise<Notification> {
    const notification = this.notifRepo.create({
      userId,
      type,
      title,
      message: message || null,
      data: data || {},
    });
    return this.notifRepo.save(notification);
  }

  async findByUser(userId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<Notification>> {
    const limit = pagination.limit || 20;
    const qb = this.notifRepo.createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC')
      .take(limit + 1);

    if (pagination.cursor) {
      const decoded = Buffer.from(pagination.cursor, 'base64').toString('utf8');
      qb.andWhere('n.id < :cursor', { cursor: decoded });
    }

    const notifications = await qb.getMany();
    const hasMore = notifications.length > limit;
    if (hasMore) notifications.pop();

    const nextCursor = hasMore && notifications.length > 0
      ? Buffer.from(notifications[notifications.length - 1].id).toString('base64')
      : null;

    return new PaginatedResponseDto(notifications, nextCursor, hasMore);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notifRepo.update({ id: notificationId, userId }, { isRead: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
  }
}
