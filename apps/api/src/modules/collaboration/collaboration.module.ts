import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaborationController } from './collaboration.controller';
import { CollaborationService } from './collaboration.service';
import { Task, TaskAssignment, TaskComment } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskAssignment, TaskComment])],
  controllers: [CollaborationController],
  providers: [CollaborationService],
  exports: [CollaborationService],
})
export class CollaborationModule {}
