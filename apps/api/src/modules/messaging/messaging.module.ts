import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Message } from './entities';
import { MessagingGateway } from './gateways/messaging.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Message])],
  providers: [MessagingGateway],
  exports: [MessagingGateway],
})
export class MessagingModule {}
