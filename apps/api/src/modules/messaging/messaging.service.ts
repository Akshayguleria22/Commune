import {
  Injectable, NotFoundException, ConflictException, ForbiddenException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Channel, Message, Friendship } from './entities';
import { FriendshipStatus, ChannelType } from '../../shared/enums';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Friendship)
    private readonly friendshipRepo: Repository<Friendship>,
  ) {}

  // ═══ Friend Requests ═══

  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    if (requesterId === addresseeId) throw new ConflictException('Cannot friend yourself');

    const existing = await this.friendshipRepo.findOne({
      where: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === FriendshipStatus.ACCEPTED) throw new ConflictException('Already friends');
      if (existing.status === FriendshipStatus.PENDING) throw new ConflictException('Friend request already pending');
      if (existing.status === FriendshipStatus.BLOCKED) throw new ForbiddenException('Unable to send request');
    }

    const friendship = this.friendshipRepo.create({ requesterId, addresseeId });
    await this.friendshipRepo.save(friendship);
    this.logger.log(`Friend request sent: ${requesterId} → ${addresseeId}`);
    return friendship;
  }

  async respondToFriendRequest(friendshipId: string, userId: string, accept: boolean): Promise<Friendship> {
    const friendship = await this.friendshipRepo.findOne({
      where: { id: friendshipId, addresseeId: userId, status: FriendshipStatus.PENDING },
    });
    if (!friendship) throw new NotFoundException('Friend request not found');

    friendship.status = accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.DECLINED;

    // Create DM channel on acceptance
    if (accept) {
      const dmChannel = this.channelRepo.create({
        communityId: null,
        name: `DM`,
        type: ChannelType.DM,
      });
      await this.channelRepo.save(dmChannel);
      friendship.dmChannelId = dmChannel.id;
    }

    await this.friendshipRepo.save(friendship);
    return friendship;
  }

  async getFriends(userId: string): Promise<Friendship[]> {
    return this.friendshipRepo.find({
      where: [
        { requesterId: userId, status: FriendshipStatus.ACCEPTED },
        { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['requester', 'addressee'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getPendingRequests(userId: string): Promise<Friendship[]> {
    return this.friendshipRepo.find({
      where: [
        { addresseeId: userId, status: FriendshipStatus.PENDING },
        { requesterId: userId, status: FriendshipStatus.PENDING },
      ],
      relations: ['requester', 'addressee'],
      order: { createdAt: 'DESC' },
    });
  }

  async removeFriend(friendshipId: string, userId: string): Promise<void> {
    const friendship = await this.friendshipRepo.findOne({
      where: [
        { id: friendshipId, requesterId: userId },
        { id: friendshipId, addresseeId: userId },
      ],
    });
    if (!friendship) throw new NotFoundException('Friendship not found');
    await this.friendshipRepo.remove(friendship);
  }

  // ═══ Direct Messages ═══

  async getDMChannels(userId: string): Promise<any[]> {
    const friendships = await this.friendshipRepo.find({
      where: [
        { requesterId: userId, status: FriendshipStatus.ACCEPTED },
        { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['requester', 'addressee'],
    });

    const channels: any[] = [];
    for (const f of friendships) {
      if (!f.dmChannelId) continue;
      const friend = f.requesterId === userId ? f.addressee : f.requester;
      const lastMessage = await this.messageRepo.findOne({
        where: { channelId: f.dmChannelId },
        order: { createdAt: 'DESC' },
      });
      channels.push({
        channelId: f.dmChannelId,
        friendshipId: f.id,
        friend: {
          id: friend.id,
          displayName: friend.displayName,
          username: friend.username,
          avatarUrl: friend.avatarUrl,
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          authorId: lastMessage.authorId,
        } : null,
      });
    }

    return channels.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? 0;
      const bTime = b.lastMessage?.createdAt ?? 0;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }

  async getOrCreateDmChannel(userId: string, friendId: string): Promise<{ channelId: string }> {
    if (userId === friendId) {
      throw new ConflictException('Cannot create DM with yourself');
    }

    const friendship = await this.friendshipRepo.findOne({
      where: [
        { requesterId: userId, addresseeId: friendId, status: FriendshipStatus.ACCEPTED },
        { requesterId: friendId, addresseeId: userId, status: FriendshipStatus.ACCEPTED },
      ],
    });

    if (!friendship) {
      throw new ForbiddenException('You can only message accepted friends');
    }

    if (friendship.dmChannelId) {
      return { channelId: friendship.dmChannelId };
    }

    const channel = this.channelRepo.create({
      communityId: null,
      name: 'DM',
      type: ChannelType.DM,
    });
    await this.channelRepo.save(channel);

    friendship.dmChannelId = channel.id;
    await this.friendshipRepo.save(friendship);

    return { channelId: channel.id };
  }

  async getMessages(channelId: string, userId: string, limit = 50, before?: string): Promise<Message[]> {
    const qb = this.messageRepo.createQueryBuilder('m')
      .where('m.channel_id = :channelId', { channelId })
      .orderBy('m.createdAt', 'DESC')
      .take(limit);

    if (before) {
      qb.andWhere('m.createdAt < :before', { before });
    }

    const messages = await qb.getMany();
    return messages.reverse();
  }

  async sendMessage(channelId: string, authorId: string, content: string): Promise<Message> {
    const message = this.messageRepo.create({ channelId, authorId, content });
    await this.messageRepo.save(message);
    return message;
  }

  // ═══ Community Channels ═══

  async getOrCreateCommunityChannel(communityId: string): Promise<Channel> {
    let channel = await this.channelRepo.findOne({
      where: { communityId, type: ChannelType.TEXT },
      order: { createdAt: 'ASC' },
    });

    if (!channel) {
      channel = this.channelRepo.create({
        communityId,
        name: 'general',
        type: ChannelType.TEXT,
      });
      await this.channelRepo.save(channel);
      this.logger.log(`Created default channel for community ${communityId}`);
    }

    return channel;
  }
}
