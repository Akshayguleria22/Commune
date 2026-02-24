import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event, Rsvp, Attendance, EventFeedback } from './entities';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Rsvp, Attendance, EventFeedback])],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
