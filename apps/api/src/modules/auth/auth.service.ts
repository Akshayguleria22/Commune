import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, Session } from './entities';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // Check existing
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (existingUser) {
      throw new ConflictException(
        existingUser.email === dto.email
          ? 'Email already registered'
          : 'Username already taken',
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      username: dto.username,
      displayName: dto.displayName,
      passwordHash,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Emit event
    this.eventEmitter.emit('user.registered', { userId: user.id });

    this.logger.log(`User registered: ${user.email}`);

    return { ...tokens, user };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`User logged in: ${user.email}`);

    return { ...tokens, user };
  }

  async validateOAuthUser(profile: {
    email: string;
    displayName: string;
    avatarUrl?: string | null;
    username?: string;
    provider: string;
    providerId: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    let user = await this.userRepository.findOne({ where: { email: profile.email } });

    if (!user) {
      // Create new user from OAuth profile
      const username = profile.username || profile.email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 6);
      user = this.userRepository.create({
        email: profile.email,
        username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl || undefined,
        isVerified: true,
        isActive: true,
      });
      await this.userRepository.save(user);
      this.eventEmitter.emit('user.registered', { userId: user.id });
      this.logger.log(`User created via OAuth (${profile.provider}): ${user.email}`);
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);
    return { ...tokens, user };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.sessionRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate refresh token
    await this.sessionRepository.remove(session);

    return this.generateTokens(session.user);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.sessionRepository.delete({ userId, refreshToken });
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    await this.userRepository.update(userId, dto);
    return this.getProfile(userId);
  }

  async findById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, username: user.username };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.accessExpiresIn', '15m') as any,
    });

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = this.sessionRepository.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    });

    await this.sessionRepository.save(session);

    return { accessToken, refreshToken };
  }
}
