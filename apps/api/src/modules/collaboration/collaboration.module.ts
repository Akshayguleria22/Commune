import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaborationController } from './collaboration.controller';
import { PersonalTaskController } from './personal-task.controller';
import { CollaborationService } from './collaboration.service';
import { Task, TaskAssignment, TaskComment } from './entities';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskAssignment, TaskComment]), CommunityModule],
  controllers: [CollaborationController, PersonalTaskController],
  providers: [CollaborationService],
  exports: [CollaborationService],
})
export class CollaborationModule {}
