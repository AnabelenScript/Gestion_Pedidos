import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { RedisModule } from './redis/redis.module';
import { SagaModule } from './saga/saga.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // Only for scaffolding/dev
      }),
      inject: [ConfigService],
    }),
    OrdersModule,
    RedisModule,
    SagaModule,
  ],
})
export class AppModule {}
