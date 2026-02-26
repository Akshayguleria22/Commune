import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio, PortfolioEntry, UserSkill } from './entities';
import { UpdatePortfolioDto, CreatePortfolioEntryDto, AddSkillDto } from './dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
    @InjectRepository(PortfolioEntry)
    private readonly entryRepo: Repository<PortfolioEntry>,
    @InjectRepository(UserSkill)
    private readonly skillRepo: Repository<UserSkill>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getByUserId(userId: string): Promise<Portfolio> {
    let portfolio = await this.portfolioRepo.findOne({ where: { userId } });
    if (!portfolio) {
      // Auto-create portfolio for user
      portfolio = this.portfolioRepo.create({ userId });
      await this.portfolioRepo.save(portfolio);
    }
    return portfolio;
  }

  async update(userId: string, dto: UpdatePortfolioDto): Promise<Portfolio> {
    const portfolio = await this.getByUserId(userId);
    Object.assign(portfolio, dto);
    return this.portfolioRepo.save(portfolio);
  }

  async getEntries(userId: string): Promise<PortfolioEntry[]> {
    const portfolio = await this.getByUserId(userId);
    return this.entryRepo.find({
      where: { portfolioId: portfolio.id, isVisible: true },
      order: { occurredAt: 'DESC' },
    });
  }

  async addEntry(userId: string, dto: CreatePortfolioEntryDto): Promise<PortfolioEntry> {
    const portfolio = await this.getByUserId(userId);
    const entry = this.entryRepo.create({
      ...dto,
      portfolioId: portfolio.id,
      occurredAt: new Date(),
      isAuto: false,
    });
    return this.entryRepo.save(entry);
  }

  async getSkills(userId: string): Promise<UserSkill[]> {
    return this.skillRepo.find({
      where: { userId },
      order: { level: 'DESC' },
    });
  }

  async addSkill(userId: string, dto: AddSkillDto): Promise<UserSkill> {
    const existing = await this.skillRepo.findOne({
      where: { userId, name: dto.name },
    });
    if (existing) throw new ConflictException('Skill already exists');

    const skill = this.skillRepo.create({
      userId,
      name: dto.name,
      level: dto.level || 1,
      isAuto: false,
    });
    return this.skillRepo.save(skill);
  }

  async removeSkill(userId: string, skillId: string): Promise<void> {
    const skill = await this.skillRepo.findOne({ where: { id: skillId, userId } });
    if (!skill) throw new NotFoundException('Skill not found');
    await this.skillRepo.remove(skill);
  }

  async getFullPortfolio(userId: string) {
    const [portfolio, entries, skills, user] = await Promise.all([
      this.getByUserId(userId),
      this.getEntries(userId),
      this.getSkills(userId),
      this.userRepo.findOne({ where: { id: userId }, select: ['id', 'username', 'displayName', 'avatarUrl', 'bio'] }),
    ]);

    return {
      ...portfolio,
      user: user ?? undefined,
      entries,
      skills,
    };
  }

  async getFullPortfolioByUsername(username: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    return this.getFullPortfolio(user.id);
  }
}
