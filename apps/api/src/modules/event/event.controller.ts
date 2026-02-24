import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto, RsvpDto, EventFeedbackDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators';
import { PaginationDto } from '../../shared/dto';
import { EventStatus } from '../../shared/enums';

@ApiTags('Events')
@Controller('communities/:communityId/events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  async create(
    @Param('communityId') communityId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventService.create(communityId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List community events' })
  async findAll(
    @Param('communityId') communityId: string,
    @Query() pagination: PaginationDto,
    @Query('status') status?: EventStatus,
    @Query('type') type?: string,
  ) {
    return this.eventService.findAll(communityId, pagination, status, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event detail' })
  async findOne(@Param('id') id: string) {
    return this.eventService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventService.update(id, dto);
  }

  @Post(':id/rsvp')
  @ApiOperation({ summary: 'RSVP to event' })
  async rsvp(
    @Param('id') eventId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RsvpDto,
  ) {
    return this.eventService.rsvp(eventId, userId, dto);
  }

  @Get(':id/rsvps')
  @ApiOperation({ summary: 'List RSVPs' })
  async getRsvps(@Param('id') id: string) {
    return this.eventService.getRsvps(id);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit event feedback' })
  async addFeedback(
    @Param('id') eventId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: EventFeedbackDto,
  ) {
    return this.eventService.addFeedback(eventId, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  async delete(@Param('id') id: string) {
    return this.eventService.delete(id);
  }
}
