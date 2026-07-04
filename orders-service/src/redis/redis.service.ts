import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private publisher: Redis;
  private subscriber: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = 6379;
    
    this.publisher = new Redis({ host, port });
    this.subscriber = new Redis({ host, port });
    console.log(`Redis connected at ${host}:${port}`);
  }

  onModuleDestroy() {
    this.publisher.quit();
    this.subscriber.quit();
  }

  async publish(channel: string, message: any) {
    await this.publisher.publish(channel, JSON.stringify(message));
  }
}
