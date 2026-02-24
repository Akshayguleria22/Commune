import {
  Entity, PrimaryGeneratedColumn, Column, Unique,
} from 'typeorm';
import { ScoreType } from '../../../shared/enums';

@Entity('reputation_scores')
@Unique(['userId', 'type'])
export class ReputationScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: ScoreType })
  type: ScoreType;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  score: number;

  @Column({ type: 'jsonb', default: {} })
  breakdown: Record<string, any>;

  @Column({ type: 'timestamptz', name: 'calculated_at', default: () => 'NOW()' })
  calculatedAt: Date;
}
