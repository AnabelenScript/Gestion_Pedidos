import { Module } from '@nestjs/common';
import { SagaService } from './saga.service';

@Module({
  providers: [SagaService],
  exports: [SagaService],
})
export class SagaModule {}
