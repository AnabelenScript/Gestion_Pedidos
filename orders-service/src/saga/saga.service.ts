import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SagaService {
  private readonly logger = new Logger(SagaService.name);
  private inventoryUrl: string;
  private paymentsUrl: string;

  constructor(private configService: ConfigService) {
    this.inventoryUrl = this.configService.get<string>('INVENTORY_URL') || 'http://localhost:3001';
    this.paymentsUrl = this.configService.get<string>('PAYMENTS_URL') || 'http://localhost:3002';
  }

  async reserveInventory(orderId: string, sku: string, quantity: number) {
    this.logger.log(`Calling Inventory Service to reserve ${quantity} of ${sku}`);
    const response = await fetch(`${this.inventoryUrl}/inventory/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, sku, quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to reserve inventory');
    }
    return response.json();
  }

  async confirmInventoryReservation(reservationId: string) {
    const response = await fetch(`${this.inventoryUrl}/inventory/reservations/${reservationId}/confirm`, {
      method: 'POST',
    });
    if (!response.ok) {
        this.logger.error(`Failed to confirm reservation ${reservationId}`);
    }
  }

  async cancelInventoryReservation(reservationId: string) {
    this.logger.log(`Compensating: Cancelling reservation ${reservationId}`);
    const response = await fetch(`${this.inventoryUrl}/inventory/reservations/${reservationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
        this.logger.error(`Failed to cancel reservation ${reservationId}`);
    }
  }

  async authorizePayment(orderId: string, amount: number) {
    this.logger.log(`Calling Payments Service to authorize payment of ${amount}`);
    const response = await fetch(`${this.paymentsUrl}/payments/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to authorize payment');
    }
    return response.json();
  }
}
