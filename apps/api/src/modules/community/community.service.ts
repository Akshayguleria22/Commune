import {
  Injectable, NotFoundException, ConflictException, ForbiddenException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Community, Membership, Role, Contribution } from './entities';
import { CreateCommunityDto, UpdateCommunityDto, CreateRoleDto } from './dto';
import { MembershipStatus, CommunityVisibility } from '../../shared/enums';
import { PaginationDto, PaginatedResponseDto } from '../../shared/dto';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    @InjectRepository(Community)
    private readonly communityRepo: Repository<Community>,
    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateCommunityDto): Promise<Community> {
    const existing = await this.communityRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Community slug already taken');
    }

    // Create community
    const community = this.communityRepo.create({
      ...dto,
      ownerId: userId,
      memberCount: 1,
    });
    await this.communityRepo.save(community);

    // Create default roles
    const ownerRole = this.roleRepo.create({
      communityId: community.id,
      name: 'Owner',
      color: '#e74c3c',
      position: 100,
      permissions: { manage_community: true, manage_roles: true, manage_members: true, manage_tasks: true, manage_events: true, manage_channels: true },
    });

    const moderatorRole = this.roleRepo.create({
      communityId: community.id,
      name: 'Moderator',
      color: '#3498db',
      position: 50,
      permissions: { manage_members: true, manage_tasks: true, manage_events: true, manage_channels: true },
    });

    const memberRole = this.roleRepo.create({
      communityId: community.id,
      name: 'Member',
      color: '#2ecc71',
      position: 10,
      isDefault: true,
      permissions: { create_tasks: true, create_events: true, send_messages: true },
    });

    await this.roleRepo.save([ownerRole, moderatorRole, memberRole]);

    // Add creator as owner
    const membership = this.membershipRepo.create({
      userId,
      communityId: community.id,
      roleId: ownerRole.id,
      status: MembershipStatus.ACTIVE,
    });
    await this.membershipRepo.save(membership);

    this.eventEmitter.emit('community.created', { communityId: community.id, userId });
    this.logger.log(`Community created: ${community.slug}`);

    return community;
  }

  async findAll(pagination: PaginationDto, tags?: string[], userId?: string): Promise<PaginatedResponseDto<Community>> {
    const qb = this.communityRepo.createQueryBuilder('c')
      .where('c.visibility = :visibility', { visibility: CommunityVisibility.PUBLIC })
      .orderBy('c.memberCount', 'DESC');

    if (userId) {
      qb.leftJoinAndMapOne(
        'c.membership',
        Membership,
        'm',
        'm.community_id = c.id AND m.user_id = :userId AND m.status = :status',
        { userId, status: MembershipStatus.ACTIVE }
      );
      qb.leftJoinAndSelect('m.role', 'role');
    }

    if (tags && tags.length > 0) {
      qb.andWhere('c.tags && :tags', { tags });
    }

    const limit = pagination.limit || 20;
    qb.take(limit + 1);

    if (pagination.cursor) {
      const decoded = Buffer.from(pagination.cursor, 'base64').toString('utf8');
      qb.andWhere('c.id < :cursor', { cursor: decoded });
    }

    const communities = await qb.getMany();
    const hasMore = communities.length > limit;
    if (hasMore) communities.pop();

    if (userId) {
      communities.forEach((c: any) => {
        if (c.membership && c.membership.role) {
          c.role = c.membership.role.name;
        }
      });
    }

    const nextCursor = hasMore && communities.length > 0
      ? Buffer.from(communities[communities.length - 1].id).toString('base64')
      : null;

    return new PaginatedResponseDto(communities, nextCursor, hasMore);
  }

  async findJoined(userId: string): Promise<Community[]> {
    const memberships = await this.membershipRepo.find({
      where: { userId, status: MembershipStatus.ACTIVE },
      relations: ['community', 'role'],
    });

    return memberships.map((m) => {
      const c = m.community as any;
      c.role = m.role?.name ?? 'Member';
      return c;
    });
  }

  async findBySlug(slug: string, userId?: string): Promise<Community> {
    const qb = this.communityRepo.createQueryBuilder('c');

    // Try slug first, then fall back to id (UUID) for resilience
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    if (isUuid) {
      qb.where('c.id = :slug OR c.slug = :slug', { slug });
    } else {
      qb.where('c.slug = :slug', { slug });
    }

    if (userId) {
      qb.leftJoinAndMapOne(
        'c.membership',
        Membership,
        'm',
        'm.community_id = c.id AND m.user_id = :userId AND m.status = :status',
        { userId, status: MembershipStatus.ACTIVE }
      );
      qb.leftJoinAndSelect('m.role', 'role');
    }

    const community = await qb.getOne();
    if (!community) throw new NotFoundException('Community not found');

    if (userId && (community as any).membership && (community as any).membership.role) {
      (community as any).role = (community as any).membership.role.name;
    }
    return community;
  }

  async findById(id: string): Promise<Community> {
    const community = await this.communityRepo.findOne({ where: { id } });
    if (!community) throw new NotFoundException('Community not found');
    return community;
  }

  async update(communityId: string, userId: string, dto: UpdateCommunityDto): Promise<Community> {
    const community = await this.findById(communityId);
    if (community.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update this community');
    }
    Object.assign(community, dto);
    return this.communityRepo.save(community);
  }

  async join(communityId: string, userId: string): Promise<Membership> {
    const community = await this.findById(communityId);

    const existing = await this.membershipRepo.findOne({
      where: { userId, communityId },
    });
    if (existing) throw new ConflictException('Already a member');

    const defaultRole = await this.roleRepo.findOne({
      where: { communityId, isDefault: true },
    });

    const membership = this.membershipRepo.create({
      userId,
      communityId,
      roleId: defaultRole!.id,
      status: community.visibility === CommunityVisibility.PUBLIC
        ? MembershipStatus.ACTIVE
        : MembershipStatus.PENDING,
    });

    await this.membershipRepo.save(membership);

    // Atomic counter increment
    await this.communityRepo.increment({ id: communityId }, 'memberCount', 1);

    this.eventEmitter.emit('community.joined', { communityId, userId });

    return membership;
  }

  async leave(communityId: string, userId: string): Promise<void> {
    const community = await this.findById(communityId);
    if (community.ownerId === userId) {
      throw new ForbiddenException('Owner cannot leave. Transfer ownership first.');
    }

    await this.membershipRepo.delete({ userId, communityId });
    await this.communityRepo.decrement({ id: communityId }, 'memberCount', 1);

    this.eventEmitter.emit('community.left', { communityId, userId });
  }

  async getMembers(communityId: string, pagination: PaginationDto) {
    const qb = this.membershipRepo.createQueryBuilder('m')
      .where('m.community_id = :communityId', { communityId })
      .andWhere('m.status = :status', { status: MembershipStatus.ACTIVE })
      .leftJoinAndSelect('m.role', 'role')
      .leftJoinAndSelect('m.user', 'user')
      .orderBy('m.joinedAt', 'DESC');

    const limit = pagination.limit || 20;
    qb.take(limit + 1);

    const members = await qb.getMany();
    const hasMore = members.length > limit;
    if (hasMore) members.pop();

    const nextCursor = hasMore && members.length > 0
      ? Buffer.from(members[members.length - 1].id).toString('base64')
      : null;

    return new PaginatedResponseDto(members, nextCursor, hasMore);
  }

  async getContributions(communityId: string, userId?: string, days: number = 365) {
    const qb = this.contributionRepo.createQueryBuilder('c')
      .select('c.contributed_at', 'date')
      .addSelect('SUM(c.weight)', 'intensity')
      .where('c.community_id = :communityId', { communityId })
      .andWhere("c.contributed_at >= CURRENT_DATE - CAST(:days AS INTEGER) * INTERVAL '1 day'", { days })
      .groupBy('c.contributed_at')
      .orderBy('c.contributed_at', 'ASC');

    if (userId) {
      qb.andWhere('c.user_id = :userId', { userId });
    }

    return qb.getRawMany();
  }

  async checkMembership(communityId: string, userId: string): Promise<Membership | null> {
    return this.membershipRepo.findOne({
      where: { communityId, userId, status: MembershipStatus.ACTIVE },
      relations: ['role'],
    });
  }
}
