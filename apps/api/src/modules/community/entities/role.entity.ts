import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Community } from './community.entity';

@Entity('roles')
@Unique(['communityId', 'name'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'community_id' })
  communityId: string;

  @ManyToOne(() => Community, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string | null;

  @Column({ type: 'jsonb', default: {} })
  permissions: Record<string, boolean>;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
