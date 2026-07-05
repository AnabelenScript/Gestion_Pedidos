import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Product } from './entities/product.entity';
import { Reservation } from './entities/reservation.entity';
import { ReservationsController } from './reservations.controller';
import { InternalApiKeyGuard } from '../auth/internal-api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Reservation])],
  controllers: [InventoryController, ReservationsController],
  providers: [InventoryService, InternalApiKeyGuard],
})
export class InventoryModule implements OnModuleInit {
  constructor(private readonly inventoryService: InventoryService) {}

  async onModuleInit() {
    // Seed some products
    try {
      await this.inventoryService.getStock('SKU-123');
    } catch {
      const productRepo = (this.inventoryService as any).productRepo;
      await productRepo.save({ sku: 'SKU-123', name: 'Laptop', stock: 100 });
      await productRepo.save({ sku: 'SKU-456', name: 'Mouse', stock: 50 });
    }
  }
}
