import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Community } from '../community/entities';
import { Event } from '../event/entities';
import { Task } from '../collaboration/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Community, Event, Task])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
