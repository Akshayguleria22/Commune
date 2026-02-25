import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from '../community/entities';
import { Event } from '../event/entities';
import { Task } from '../collaboration/entities';
import { User } from '../auth/entities';

export interface SearchResult {
  type: 'community' | 'user' | 'event' | 'task';
  id: string;
  title: string;
  subtitle: string | null;
  avatarUrl: string | null;
  score: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(Community)
    private readonly communityRepo: Repository<Community>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const searchTerm = `%${query.toLowerCase()}%`;
    const results: SearchResult[] = [];

    // Search communities
    const communities = await this.communityRepo
      .createQueryBuilder('c')
      .where('LOWER(c.name) LIKE :term', { term: searchTerm })
      .orWhere('LOWER(c.description) LIKE :term', { term: searchTerm })
      .take(limit)
      .getMany();

    for (const c of communities) {
      results.push({
        type: 'community',
        id: c.id,
        title: c.name,
        subtitle: c.description?.slice(0, 120) || null,
        avatarUrl: c.avatarUrl,
        score: c.memberCount,
      });
    }

    // Search events
    const events = await this.eventRepo
      .createQueryBuilder('e')
      .where('LOWER(e.title) LIKE :term', { term: searchTerm })
      .orWhere('LOWER(e.description) LIKE :term', { term: searchTerm })
      .take(limit)
      .getMany();

    for (const e of events) {
      results.push({
        type: 'event',
        id: e.id,
        title: e.title,
        subtitle: e.description?.slice(0, 120) || null,
        avatarUrl: null,
        score: e.rsvpCount,
      });
    }

    // Search users
    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('LOWER(u.display_name) LIKE :term', { term: searchTerm })
      .orWhere('LOWER(u.username) LIKE :term', { term: searchTerm })
      .take(limit)
      .getMany();

    for (const u of users) {
      results.push({
        type: 'user',
        id: u.id,
        title: u.displayName || u.username,
        subtitle: `@${u.username}`,
        avatarUrl: u.avatarUrl,
        score: 1, // Base score, could be dynamic
      });
    }

    // Search tasks
    const tasks = await this.taskRepo
      .createQueryBuilder('t')
      .where('LOWER(t.title) LIKE :term', { term: searchTerm })
      .orWhere('LOWER(t.description) LIKE :term', { term: searchTerm })
      .take(limit)
      .getMany();

    for (const t of tasks) {
      results.push({
        type: 'task',
        id: t.id,
        title: t.title,
        subtitle: t.description?.slice(0, 120) || null,
        avatarUrl: null,
        score: 0,
      });
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}
