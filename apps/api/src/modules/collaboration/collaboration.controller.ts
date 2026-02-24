import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CollaborationService } from './collaboration.service';
import { CreateTaskDto, UpdateTaskDto, CreateTaskCommentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators';
import { PaginationDto } from '../../shared/dto';
import { TaskStatus } from '../../shared/enums';

@ApiTags('Tasks')
@Controller('communities/:communityId/tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  async create(
    @Param('communityId') communityId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.collaborationService.createTask(communityId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks' })
  async findAll(
    @Param('communityId') communityId: string,
    @Query() pagination: PaginationDto,
    @Query('status') status?: TaskStatus,
  ) {
    return this.collaborationService.findTasks(communityId, pagination, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task detail' })
  async findOne(@Param('id') id: string) {
    return this.collaborationService.findTaskById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.collaborationService.updateTask(id, dto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'List task comments' })
  async getComments(@Param('id') id: string) {
    return this.collaborationService.getComments(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment' })
  async addComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskCommentDto,
  ) {
    return this.collaborationService.addComment(id, userId, dto);
  }
}
