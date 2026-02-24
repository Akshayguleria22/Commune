import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreateCommunityDto, UpdateCommunityDto, CreateRoleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators';
import { PaginationDto } from '../../shared/dto';

@ApiTags('Communities')
@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new community' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommunityDto,
  ) {
    return this.communityService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List public communities' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('tags') tags?: string,
  ) {
    const tagArray = tags ? tags.split(',').map(t => t.trim()) : undefined;
    return this.communityService.findAll(pagination, tagArray);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get community by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.communityService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update community' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.communityService.update(id, userId, dto);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a community' })
  async join(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.communityService.join(id, userId);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a community' })
  async leave(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.communityService.leave(id, userId);
    return { message: 'Left community successfully' };
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List community members' })
  async getMembers(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.communityService.getMembers(id, pagination);
  }

  @Get(':id/contributions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contribution heatmap data' })
  async getContributions(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Query('days') days?: number,
  ) {
    return this.communityService.getContributions(id, userId, days || 365);
  }
}
