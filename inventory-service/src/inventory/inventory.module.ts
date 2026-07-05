import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Product } from './entities/product.entity';
import { Reservation } from './entities/reservation.entity';
import { ReservationsController } from './reservations.controller';
import { InternalApiKeyGuard } from '../auth/internal-api-key.guard';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Reservation])],
  controllers: [InventoryController, ReservationsController],
  providers: [InventoryService, InternalApiKeyGuard],
})
export class InventoryModule implements OnModuleInit {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.configService.getOrThrow<boolean>('SEED_DEMO_DATA')) {
      await this.inventoryService.seedDemoProducts();
    }
  }
}
