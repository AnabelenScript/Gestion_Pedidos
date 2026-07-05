import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SagaService {
  private readonly logger = new Logger(SagaService.name);
  private inventoryUrl: string;
  private paymentsUrl: string;
  private internalApiKey: string;

  constructor(private configService: ConfigService) {
    this.inventoryUrl = this.configService.getOrThrow<string>('INVENTORY_URL');
    this.paymentsUrl = this.configService.getOrThrow<string>('PAYMENTS_URL');
    this.internalApiKey =
      this.configService.getOrThrow<string>('INTERNAL_API_KEY');
  }

  async reserveInventory(orderId: string, sku: string, quantity: number) {
    this.logger.log(
      `Calling Inventory Service to reserve ${quantity} of ${sku}`,
    );
    const response = await fetch(`${this.inventoryUrl}/v1/reservations`, {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify({ orderId, sku, quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to reserve inventory');
    }
    return response.json();
  }

  async confirmInventoryReservation(reservationId: string) {
    const response = await fetch(
      `${this.inventoryUrl}/v1/reservations/${reservationId}/confirm`,
      {
        method: 'POST',
        headers: this.headers(),
      },
    );
    if (!response.ok) {
      this.logger.error(`Failed to confirm reservation ${reservationId}`);
    }
  }

  async cancelInventoryReservation(reservationId: string) {
    this.logger.log(`Compensating: Cancelling reservation ${reservationId}`);
    const response = await fetch(
      `${this.inventoryUrl}/v1/reservations/${reservationId}`,
      {
        method: 'DELETE',
        headers: this.headers(),
      },
    );
    if (!response.ok) {
      this.logger.error(`Failed to cancel reservation ${reservationId}`);
    }
  }

  async authorizePayment(orderId: string, amount: number) {
    this.logger.log(
      `Calling Payments Service to authorize payment of ${amount}`,
    );
    const response = await fetch(`${this.paymentsUrl}/v1/payments/authorize`, {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify({ orderId, amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to authorize payment');
    }
    return response.json();
  }

  private headers(withJsonContent = false): Record<string, string> {
    return {
      ...(withJsonContent ? { 'Content-Type': 'application/json' } : {}),
      'x-internal-api-key': this.internalApiKey,
    };
  }
}
