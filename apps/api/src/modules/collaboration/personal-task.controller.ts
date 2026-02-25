import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CollaborationService } from './collaboration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators';

@ApiTags('Personal Tasks')
@Controller('tasks/me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PersonalTaskController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks assigned to the current user' })
  async findPersonalTasks(@CurrentUser('id') userId: string) {
    return this.collaborationService.findPersonalTasks(userId);
  }
}
