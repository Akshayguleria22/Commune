// ============================================
// COMMUNE — Shared Types
// Types shared between API and Web packages
// ============================================

// User types
export interface IUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface IUserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

// Auth types
export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

// Community types
export interface ICommunity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  visibility: 'public' | 'private' | 'invite_only';
  memberCount: number;
  tags: string[];
  createdAt: string;
}

// Task types
export interface ITask {
  id: string;
  communityId: string;
  title: string;
  description: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  creator: IUserSummary;
  assignees: IUserSummary[];
  dueDate: string | null;
  tags: string[];
  createdAt: string;
}

// Event types
export interface IEvent {
  id: string;
  communityId: string;
  title: string;
  description: string | null;
  type: 'online' | 'offline' | 'hybrid';
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  organizer: IUserSummary;
  startsAt: string;
  endsAt: string;
  rsvpCount: number;
  tags: string[];
}

// Pagination
export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total?: number;
  };
}

// Notification types
export interface INotification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  data: Record<string, any>;
  createdAt: string;
}

// Reputation types
export interface IReputation {
  builder: number;
  mentor: number;
  organizer: number;
}

// Portfolio types
export interface IPortfolio {
  user: IUser;
  headline: string | null;
  summary: string | null;
  theme: { color: string };
  entries: IPortfolioEntry[];
  skills: ISkill[];
  reputation: IReputation;
}

export interface IPortfolioEntry {
  id: string;
  type: string;
  title: string;
  description: string | null;
  isVisible: boolean;
  occurredAt: string;
}

export interface ISkill {
  id: string;
  name: string;
  level: number;
  isAuto: boolean;
}

// WebSocket event types
export interface IWsMessage {
  id: string;
  channelId: string;
  content: string;
  author: IUserSummary;
  threadId: string | null;
  isPinned: boolean;
  isEdited: boolean;
  createdAt: string;
}

// Search types
export interface ISearchResult {
  type: 'community' | 'user' | 'event' | 'task';
  id: string;
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  score: number;
}

// Contribution heatmap
export interface IContribution {
  date: string;
  intensity: number;
}
