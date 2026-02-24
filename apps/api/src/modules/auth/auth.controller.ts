import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, UpdateProfileDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: this.sanitizeUser(result.user),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: this.sanitizeUser(result.user),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate session' })
  async logout(
    @CurrentUser('id') userId: string,
    @Body() dto: RefreshTokenDto,
  ) {
    await this.authService.logout(userId, dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.authService.getProfile(userId);
    return this.sanitizeUser(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.authService.updateProfile(userId, dto);
    return this.sanitizeUser(user);
  }

  // ═══ OAuth Routes ═══

  @Get('oauth/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  googleAuth() {
    // Passport will redirect to Google
  }

  @Get('oauth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const result = await this.authService.validateOAuthUser(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: JSON.stringify(this.sanitizeUser(result.user)),
    });
    res.redirect(`${frontendUrl}/oauth/callback?${params.toString()}`);
  }

  @Get('oauth/github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Initiate GitHub OAuth' })
  githubAuth() {
    // Passport will redirect to GitHub
  }

  @Get('oauth/github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: any) {
    const result = await this.authService.validateOAuthUser(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: JSON.stringify(this.sanitizeUser(result.user)),
    });
    res.redirect(`${frontendUrl}/oauth/callback?${params.toString()}`);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, deletedAt, ...sanitized } = user;
    return sanitized;
  }
}
