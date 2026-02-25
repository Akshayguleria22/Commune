import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PortfolioService } from './portfolio.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskAssignment } from '../collaboration/entities/task.entity';
import { Community } from '../community/entities/community.entity';
import { PortfolioEntryType } from '../../shared/enums';

@Injectable()
export class PortfolioListener {
  private readonly logger = new Logger(PortfolioListener.name);

  constructor(
    private readonly portfolioService: PortfolioService,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskAssignment)
    private readonly assignmentRepo: Repository<TaskAssignment>,
    @InjectRepository(Community)
    private readonly communityRepo: Repository<Community>,
  ) {}

  @OnEvent('community.member_joined')
  async handleCommunityJoined(payload: { communityId: string; userId: string }) {
    try {
      const community = await this.communityRepo.findOne({ where: { id: payload.communityId } });
      if (!community) return;

      await this.portfolioService.addEntry(payload.userId, {
        title: `Joined Community: ${community.name}`,
        type: PortfolioEntryType.CUSTOM,
        communityId: community.id,
        metadata: { communityName: community.name },
      });
    } catch (err) {
      this.logger.error('Failed to update portfolio for member joined', err);
    }
  }

  @OnEvent('task.completed')
  async handleTaskCompleted(payload: { taskId: string; communityId: string }) {
    try {
      const task = await this.taskRepo.findOne({ where: { id: payload.taskId } });
      const assignments = await this.assignmentRepo.find({ where: { taskId: payload.taskId } });
      const community = await this.communityRepo.findOne({ where: { id: payload.communityId } });
      
      if (!task || !community || !assignments.length) return;

      for (const assignment of assignments) {
        await this.portfolioService.addEntry(assignment.userId, {
          title: `Completed Task: ${task.title}`,
          type: PortfolioEntryType.TASK_COMPLETED,
          communityId: community.id,
          metadata: { sourceId: task.id },
        });
      }
    } catch (err) {
      this.logger.error('Failed to update portfolio for task completion', err);
    }
  }
}
