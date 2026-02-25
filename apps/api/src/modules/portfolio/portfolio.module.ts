import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio, PortfolioEntry, UserSkill } from './entities';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PortfolioListener } from './portfolio.listener';
import { Task, TaskAssignment } from '../collaboration/entities/task.entity';
import { Community } from '../community/entities/community.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio, PortfolioEntry, UserSkill, Task, TaskAssignment, Community])],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioListener],
  exports: [PortfolioService],
})
export class PortfolioModule {}
