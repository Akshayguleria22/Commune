import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  DeleteDateColumn, ManyToOne, JoinColumn, Unique, Check,
} from 'typeorm';
import { EventType, EventStatus, RsvpStatus } from '../../../shared/enums';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'community_id' })
  communityId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: EventType })
  type: EventType;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.DRAFT })
  status: EventStatus;

  @Column({ type: 'uuid', name: 'organizer_id' })
  organizerId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'meeting_url' })
  meetingUrl: string | null;

  @Column({ type: 'timestamptz', name: 'starts_at' })
  startsAt: Date;

  @Column({ type: 'timestamptz', name: 'ends_at' })
  endsAt: Date;

  @Column({ type: 'int', nullable: true, name: 'max_attendees' })
  maxAttendees: number | null;

  @Column({ type: 'int', default: 0, name: 'rsvp_count' })
  rsvpCount: number;

  @Column({ type: 'varchar', array: true, default: '{}' })
  tags: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;
}

@Entity('rsvps')
@Unique(['eventId', 'userId'])
export class Rsvp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: RsvpStatus, default: RsvpStatus.GOING })
  status: RsvpStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}

@Entity('attendance')
@Unique(['eventId', 'userId'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'timestamptz', name: 'checked_in_at', default: () => 'NOW()' })
  checkedInAt: Date;
}

@Entity('event_feedback')
@Unique(['eventId', 'userId'])
export class EventFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
