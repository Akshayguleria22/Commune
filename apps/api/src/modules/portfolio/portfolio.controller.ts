import {
  Controller, Get, Patch, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { UpdatePortfolioDto, CreatePortfolioEntryDto, AddSkillDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my portfolio' })
  async getMyPortfolio(@CurrentUser('id') userId: string) {
    return this.portfolioService.getFullPortfolio(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my portfolio' })
  async updateMyPortfolio(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(userId, dto);
  }

  @Post('me/entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add portfolio entry' })
  async addEntry(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePortfolioEntryDto,
  ) {
    return this.portfolioService.addEntry(userId, dto);
  }

  @Post('me/skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a skill' })
  async addSkill(
    @CurrentUser('id') userId: string,
    @Body() dto: AddSkillDto,
  ) {
    return this.portfolioService.addSkill(userId, dto);
  }

  @Delete('me/skills/:skillId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a skill' })
  async removeSkill(
    @CurrentUser('id') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.portfolioService.removeSkill(userId, skillId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get a user portfolio (public)' })
  async getUserPortfolio(@Param('userId') userId: string) {
    return this.portfolioService.getFullPortfolio(userId);
  }
}
