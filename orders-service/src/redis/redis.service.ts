import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private publisher: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.getOrThrow<string>('REDIS_HOST');
    const port = this.configService.getOrThrow<number>('REDIS_PORT');
    this.publisher = new Redis({ host, port });
  }

  onModuleDestroy() {
    this.publisher.disconnect();
  }

  publish(channel: string, message: unknown): Promise<number> {
    return this.publisher.publish(channel, JSON.stringify(message));
  }
}
