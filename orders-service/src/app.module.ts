import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { RedisModule } from './redis/redis.module';
import { SagaModule } from './saga/saga.module';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DATABASE_HOST'),
        port: configService.getOrThrow<number>('DATABASE_PORT'),
        username: configService.getOrThrow<string>('DATABASE_USER'),
        password: configService.getOrThrow<string>('DATABASE_PASS'),
        database: configService.getOrThrow<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: configService.getOrThrow<boolean>('DATABASE_SYNCHRONIZE'),
        ssl: configService.getOrThrow<boolean>('DATABASE_SSL')
          ? {
              rejectUnauthorized: configService.getOrThrow<boolean>(
                'DATABASE_SSL_REJECT_UNAUTHORIZED',
              ),
            }
          : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    OrdersModule,
    RedisModule,
    SagaModule,
  ],
})
export class AppModule {}
