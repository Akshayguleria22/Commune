import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { CommunityModule } from './modules/community/community.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { EventModule } from './modules/event/event.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { ReputationModule } from './modules/reputation/reputation.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationModule } from './modules/notification/notification.module';
import { MediaModule } from './modules/media/media.module';
import { QueueModule } from './modules/queue/queue.module';
import { databaseConfig } from './config/database.config';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: false, // We use migrations instead
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<string>('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
      inject: [ConfigService],
    }),

    // Event bus for module decoupling
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,  // 1 minute
        limit: 100,
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 500,
      },
    ]),

    // Domain modules
    AuthModule,
    CommunityModule,
    CollaborationModule,
    MessagingModule,
    EventModule,
    PortfolioModule,

    // Intelligence modules
    RecommendationModule,
    ReputationModule,
    SearchModule,

    // Infrastructure modules
    NotificationModule,
    MediaModule,
    QueueModule,
  ],
})
export class AppModule {}
