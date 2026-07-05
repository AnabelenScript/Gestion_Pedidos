import { Module } from '@nestjs/common';
import { RedisSubscriberService } from './redis.service';

@Module({
  providers: [RedisSubscriberService],
})
export class RedisModule {}
