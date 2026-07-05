import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisSubscriberService implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis;
  private readonly logger = new Logger(RedisSubscriberService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    this.subscriber = new Redis({ host, port });

    this.subscriber.subscribe('order.confirmed', 'order.cancelled', (err, count) => {
      if (err) {
        this.logger.error('Failed to subscribe: %s', err.message);
      } else {
        this.logger.log(`Subscribed successfully to ${count} channels.`);
      }
    });

    this.subscriber.on('message', (channel, message) => {
      const payload = JSON.parse(message);
      if (channel === 'order.confirmed') {
        this.logger.log(`[Event Received] order.confirmed: Order ${payload.orderId} processed successfully.`);
      } else if (channel === 'order.cancelled') {
        this.logger.log(`[Event Received] order.cancelled: Order ${payload.orderId} was cancelled. Reason: ${payload.reason}`);
      }
    });
  }

  onModuleDestroy() {
    this.subscriber.disconnect();
  }
}
