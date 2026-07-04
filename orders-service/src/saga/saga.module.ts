import { Module } from '@nestjs/common';
import { SagaService } from './saga.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [SagaService],
  exports: [SagaService],
})
export class SagaModule {}
