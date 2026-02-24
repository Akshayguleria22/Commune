import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, Index,
} from 'typeorm';
import { CommunityVisibility } from '../../../shared/enums';

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'banner_url' })
  bannerUrl: string | null;

  @Column({ type: 'enum', enum: CommunityVisibility, default: CommunityVisibility.PUBLIC })
  visibility: CommunityVisibility;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({ type: 'int', default: 0, name: 'member_count' })
  memberCount: number;

  @Column({ type: 'varchar', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;
}
