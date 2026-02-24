import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Community } from './community.entity';
import { Role } from './role.entity';
import { MembershipStatus } from '../../../shared/enums';

@Entity('memberships')
@Unique(['userId', 'communityId'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'community_id' })
  communityId: string;

  @ManyToOne(() => Community, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.ACTIVE })
  status: MembershipStatus;

  @Column({ type: 'int', default: 0, name: 'contribution_count' })
  contributionCount: number;

  @Column({ type: 'timestamptz', name: 'joined_at', default: () => 'NOW()' })
  joinedAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
