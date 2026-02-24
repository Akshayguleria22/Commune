import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:3000/api/v1/auth/oauth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { username, displayName, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value || `${username}@github.com`,
      displayName: displayName || username,
      username,
      avatarUrl: photos?.[0]?.value || null,
      provider: 'github',
      providerId: profile.id,
      accessToken,
    };
    done(null, user);
  }
}
