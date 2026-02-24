import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 500, unique: true, name: 'refresh_token' })
  refreshToken: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string | null;

  @Column({ type: 'inet', nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
