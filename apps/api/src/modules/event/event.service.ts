import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event, Rsvp, EventFeedback } from './entities';
import { CreateEventDto, UpdateEventDto, RsvpDto, EventFeedbackDto } from './dto';
import { EventStatus, RsvpStatus } from '../../shared/enums';
import { PaginationDto, PaginatedResponseDto } from '../../shared/dto';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Rsvp)
    private readonly rsvpRepo: Repository<Rsvp>,
    @InjectRepository(EventFeedback)
    private readonly feedbackRepo: Repository<EventFeedback>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(communityId: string, userId: string, dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepo.create({
      ...dto,
      communityId,
      organizerId: userId,
      status: EventStatus.PUBLISHED,
    });
    await this.eventRepo.save(event);
    this.eventEmitter.emit('event.created', { eventId: event.id, communityId, userId });
    this.logger.log(`Event created: ${event.title}`);
    return event;
  }

  async findAll(
    communityId: string,
    pagination: PaginationDto,
    status?: EventStatus,
    type?: string,
  ): Promise<PaginatedResponseDto<Event>> {
    const qb = this.eventRepo.createQueryBuilder('e')
      .where('e.community_id = :communityId', { communityId })
      .orderBy('e.starts_at', 'ASC');

    if (status) {
      qb.andWhere('e.status = :status', { status });
    }
    if (type) {
      qb.andWhere('e.type = :type', { type });
    }

    const limit = pagination.limit || 20;
    qb.take(limit + 1);

    if (pagination.cursor) {
      const decoded = Buffer.from(pagination.cursor, 'base64').toString('utf8');
      qb.andWhere('e.id < :cursor', { cursor: decoded });
    }

    const events = await qb.getMany();
    const hasMore = events.length > limit;
    if (hasMore) events.pop();

    const nextCursor = hasMore && events.length > 0
      ? Buffer.from(events[events.length - 1].id).toString('base64')
      : null;

    return new PaginatedResponseDto(events, nextCursor, hasMore);
  }

  async findUpcoming(limit: number = 10): Promise<Event[]> {
    return this.eventRepo.createQueryBuilder('e')
      .where('e.status = :status', { status: EventStatus.PUBLISHED })
      .andWhere('e.starts_at > NOW()')
      .orderBy('e.starts_at', 'ASC')
      .take(limit)
      .getMany();
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(eventId: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findById(eventId);
    Object.assign(event, dto);
    await this.eventRepo.save(event);
    this.eventEmitter.emit('event.updated', { eventId: event.id });
    return event;
  }

  async rsvp(eventId: string, userId: string, dto: RsvpDto): Promise<Rsvp> {
    const event = await this.findById(eventId);

    let rsvp = await this.rsvpRepo.findOne({ where: { eventId, userId } });
    if (rsvp) {
      rsvp.status = dto.status;
      await this.rsvpRepo.save(rsvp);
    } else {
      rsvp = this.rsvpRepo.create({ eventId, userId, status: dto.status });
      await this.rsvpRepo.save(rsvp);
      if (dto.status === RsvpStatus.GOING) {
        await this.eventRepo.increment({ id: eventId }, 'rsvpCount', 1);
      }
    }

    this.eventEmitter.emit('event.rsvp', { eventId, userId, status: dto.status });
    return rsvp;
  }

  async getRsvps(eventId: string): Promise<Rsvp[]> {
    return this.rsvpRepo.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
  }

  async addFeedback(eventId: string, userId: string, dto: EventFeedbackDto): Promise<EventFeedback> {
    await this.findById(eventId);

    const existing = await this.feedbackRepo.findOne({ where: { eventId, userId } });
    if (existing) throw new ConflictException('Feedback already submitted');

    const feedback = this.feedbackRepo.create({
      eventId,
      userId,
      rating: dto.rating,
      comment: dto.comment || null,
    });
    return this.feedbackRepo.save(feedback);
  }

  async delete(eventId: string): Promise<void> {
    const event = await this.findById(eventId);
    await this.eventRepo.softRemove(event);
  }
}
