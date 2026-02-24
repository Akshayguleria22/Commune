import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { AuthProvider } from '../../../shared/enums';

@Entity('oauth_accounts')
@Unique(['provider', 'providerId'])
export class OAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: AuthProvider })
  provider: AuthProvider;

  @Column({ type: 'varchar', length: 255, name: 'provider_id' })
  providerId: string;

  @Column({ type: 'text', nullable: true, name: 'access_token' })
  accessToken: string | null;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  refreshToken: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
