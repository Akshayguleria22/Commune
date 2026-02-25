import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators';

@ApiTags('Messaging')
@Controller('messaging')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // ═══ Friends ═══

  @Post('friends/request')
  @ApiOperation({ summary: 'Send a friend request' })
  async sendFriendRequest(
    @CurrentUser('id') userId: string,
    @Body('addresseeId') addresseeId: string,
  ) {
    return this.messagingService.sendFriendRequest(userId, addresseeId);
  }

  @Post('friends/:id/respond')
  @ApiOperation({ summary: 'Accept or decline a friend request' })
  async respondToRequest(
    @Param('id') friendshipId: string,
    @CurrentUser('id') userId: string,
    @Body('accept') accept: boolean,
  ) {
    return this.messagingService.respondToFriendRequest(friendshipId, userId, accept);
  }

  @Get('friends')
  @ApiOperation({ summary: 'Get accepted friends list' })
  async getFriends(@CurrentUser('id') userId: string) {
    return this.messagingService.getFriends(userId);
  }

  @Get('friends/pending')
  @ApiOperation({ summary: 'Get pending friend requests' })
  async getPendingRequests(@CurrentUser('id') userId: string) {
    return this.messagingService.getPendingRequests(userId);
  }

  @Delete('friends/:id')
  @ApiOperation({ summary: 'Remove a friend' })
  async removeFriend(
    @Param('id') friendshipId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.messagingService.removeFriend(friendshipId, userId);
    return { message: 'Friend removed' };
  }

  // ═══ DM Conversations ═══

  @Get('dm/channels')
  @ApiOperation({ summary: 'List DM conversations' })
  async getDMChannels(@CurrentUser('id') userId: string) {
    return this.messagingService.getDMChannels(userId);
  }

  @Post('dm/channel')
  @ApiOperation({ summary: 'Get or create a DM channel with a friend' })
  async getOrCreateDmChannel(
    @CurrentUser('id') userId: string,
    @Body('friendId') friendId: string,
  ) {
    return this.messagingService.getOrCreateDmChannel(userId, friendId);
  }

  @Get('dm/:channelId/messages')
  @ApiOperation({ summary: 'Get messages in a DM channel' })
  async getMessages(
    @Param('channelId') channelId: string,
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.messagingService.getMessages(channelId, userId, limit || 50, before);
  }

  @Post('dm/:channelId/messages')
  @ApiOperation({ summary: 'Send a DM' })
  async sendMessage(
    @Param('channelId') channelId: string,
    @CurrentUser('id') userId: string,
    @Body('content') content: string,
  ) {
    return this.messagingService.sendMessage(channelId, userId, content);
  }

  // ═══ Community Channels ═══

  @Get('community/:communityId/channel')
  @ApiOperation({ summary: 'Get or create default community text channel' })
  async getCommunityChannel(
    @Param('communityId') communityId: string,
  ) {
    return this.messagingService.getOrCreateCommunityChannel(communityId);
  }

  @Get('community/channel/:channelId/messages')
  @ApiOperation({ summary: 'Get messages in a community channel' })
  async getCommunityMessages(
    @Param('channelId') channelId: string,
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.messagingService.getMessages(channelId, userId, limit || 50, before);
  }

  @Post('community/channel/:channelId/messages')
  @ApiOperation({ summary: 'Send a message in a community channel' })
  async sendCommunityMessage(
    @Param('channelId') channelId: string,
    @CurrentUser('id') userId: string,
    @Body('content') content: string,
  ) {
    return this.messagingService.sendMessage(channelId, userId, content);
  }
}
