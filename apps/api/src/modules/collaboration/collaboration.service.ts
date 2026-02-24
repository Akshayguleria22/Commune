import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Task, TaskAssignment, TaskComment } from './entities';
import { CreateTaskDto, UpdateTaskDto, CreateTaskCommentDto } from './dto';
import { TaskStatus } from '../../shared/enums';
import { PaginationDto, PaginatedResponseDto } from '../../shared/dto';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskAssignment)
    private readonly assignmentRepo: Repository<TaskAssignment>,
    @InjectRepository(TaskComment)
    private readonly commentRepo: Repository<TaskComment>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createTask(communityId: string, userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create({
      ...dto,
      communityId,
      creatorId: userId,
    });
    await this.taskRepo.save(task);

    // Create assignments
    if (dto.assigneeIds?.length) {
      const assignments = dto.assigneeIds.map(assigneeId =>
        this.assignmentRepo.create({ taskId: task.id, userId: assigneeId }),
      );
      await this.assignmentRepo.save(assignments);
      this.eventEmitter.emit('task.assigned', {
        taskId: task.id,
        assigneeIds: dto.assigneeIds,
        communityId,
      });
    }

    this.eventEmitter.emit('task.created', { taskId: task.id, communityId, userId });
    return task;
  }

  async findTasks(communityId: string, pagination: PaginationDto, status?: TaskStatus): Promise<PaginatedResponseDto<Task>> {
    const qb = this.taskRepo.createQueryBuilder('t')
      .where('t.community_id = :communityId', { communityId })
      .orderBy('t.position', 'ASC')
      .addOrderBy('t.created_at', 'DESC');

    if (status) {
      qb.andWhere('t.status = :status', { status });
    }

    const limit = pagination.limit || 20;
    qb.take(limit + 1);

    const tasks = await qb.getMany();
    const hasMore = tasks.length > limit;
    if (hasMore) tasks.pop();

    const nextCursor = hasMore && tasks.length > 0
      ? Buffer.from(tasks[tasks.length - 1].id).toString('base64')
      : null;

    return new PaginatedResponseDto(tasks, nextCursor, hasMore);
  }

  async findTaskById(taskId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async updateTask(taskId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findTaskById(taskId);
    const previousStatus = task.status;

    Object.assign(task, dto);

    if (dto.status === TaskStatus.DONE && previousStatus !== TaskStatus.DONE) {
      task.completedAt = new Date();
      this.eventEmitter.emit('task.completed', { taskId: task.id, communityId: task.communityId });
    }

    await this.taskRepo.save(task);
    this.eventEmitter.emit('task.updated', { taskId: task.id, status: task.status, communityId: task.communityId });

    return task;
  }

  async addComment(taskId: string, userId: string, dto: CreateTaskCommentDto): Promise<TaskComment> {
    await this.findTaskById(taskId); // verify task exists
    const comment = this.commentRepo.create({
      taskId,
      authorId: userId,
      content: dto.content,
      parentId: dto.parentId || null,
    });
    return this.commentRepo.save(comment);
  }

  async getComments(taskId: string): Promise<TaskComment[]> {
    return this.commentRepo.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });
  }
}
