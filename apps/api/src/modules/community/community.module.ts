import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { Community, Membership, Role, Contribution } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Community, Membership, Role, Contribution])],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
