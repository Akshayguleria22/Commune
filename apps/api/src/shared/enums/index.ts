export enum CommunityVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only',
}

export enum MembershipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  BANNED = 'banned',
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum EventType {
  ONLINE = 'online',
  OFFLINE = 'offline',
  HYBRID = 'hybrid',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum RsvpStatus {
  GOING = 'going',
  MAYBE = 'maybe',
  NOT_GOING = 'not_going',
}

export enum ChannelType {
  TEXT = 'text',
  ANNOUNCEMENT = 'announcement',
  TASK_LINKED = 'task_linked',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
}

export enum ScoreType {
  BUILDER = 'builder',
  MENTOR = 'mentor',
  ORGANIZER = 'organizer',
}

export enum PortfolioEntryType {
  TASK_COMPLETED = 'task_completed',
  EVENT_ATTENDED = 'event_attended',
  EVENT_ORGANIZED = 'event_organized',
  COMMUNITY_FOUNDED = 'community_founded',
  ROLE_HELD = 'role_held',
  PROJECT = 'project',
  CUSTOM = 'custom',
}
