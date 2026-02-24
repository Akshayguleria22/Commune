import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  Unique,
} from 'typeorm';
import { PortfolioEntryType } from '../../../shared/enums';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  headline: string | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'jsonb', default: { color: '#6C5CE7' } })
  theme: Record<string, any>;

  @Column({ type: 'boolean', default: true, name: 'is_public' })
  isPublic: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}

@Entity('portfolio_entries')
export class PortfolioEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'portfolio_id' })
  portfolioId: string;

  @Column({ type: 'enum', enum: PortfolioEntryType })
  type: PortfolioEntryType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'community_id' })
  communityId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'source_id' })
  sourceId: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_auto' })
  isAuto: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_visible' })
  isVisible: boolean;

  @Column({ type: 'timestamptz', name: 'occurred_at' })
  occurredAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}

@Entity('user_skills')
@Unique(['userId', 'name'])
export class UserSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'smallint', default: 1 })
  level: number;

  @Column({ type: 'boolean', default: false, name: 'is_auto' })
  isAuto: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
