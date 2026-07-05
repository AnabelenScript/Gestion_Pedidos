import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ReservationResult {
  id: string;
  orderId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  status: string;
}

export interface PaymentResult {
  id: string;
  orderId: string;
  amount: number;
  status: string;
}

@Injectable()
export class SagaService {
  private readonly logger = new Logger(SagaService.name);
  private readonly inventoryUrl: string;
  private readonly paymentsUrl: string;
  private readonly internalApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.inventoryUrl = this.configService.getOrThrow<string>('INVENTORY_URL');
    this.paymentsUrl = this.configService.getOrThrow<string>('PAYMENTS_URL');
    this.internalApiKey =
      this.configService.getOrThrow<string>('INTERNAL_API_KEY');
  }

  async reserveInventory(
    orderId: string,
    sku: string,
    quantity: number,
  ): Promise<ReservationResult> {
    this.logger.log(
      `Calling Inventory Service to reserve ${quantity} of ${sku}`,
    );
    const response = await fetch(`${this.inventoryUrl}/v1/reservations`, {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify({ orderId, sku, quantity }),
    });
    return this.responseBody(response, 'Failed to reserve inventory');
  }

  async confirmInventoryReservation(
    reservationId: string,
  ): Promise<ReservationResult> {
    const response = await fetch(
      `${this.inventoryUrl}/v1/reservations/${reservationId}/confirm`,
      { method: 'POST', headers: this.headers() },
    );
    return this.responseBody(response, 'Failed to confirm inventory');
  }

  async cancelInventoryReservation(
    reservationId: string,
  ): Promise<ReservationResult> {
    this.logger.log(`Compensating: Cancelling reservation ${reservationId}`);
    const response = await fetch(
      `${this.inventoryUrl}/v1/reservations/${reservationId}`,
      { method: 'DELETE', headers: this.headers() },
    );
    return this.responseBody(response, 'Failed to cancel inventory');
  }

  async authorizePayment(
    orderId: string,
    amount: number,
  ): Promise<PaymentResult> {
    this.logger.log(
      `Calling Payments Service to authorize payment of ${amount}`,
    );
    const response = await fetch(`${this.paymentsUrl}/v1/payments/authorize`, {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify({ orderId, amount }),
    });
    return this.responseBody(response, 'Failed to authorize payment');
  }

  async voidPayment(paymentId: string): Promise<PaymentResult> {
    this.logger.log(`Compensating: Voiding payment ${paymentId}`);
    const response = await fetch(
      `${this.paymentsUrl}/v1/payments/${paymentId}/void`,
      { method: 'POST', headers: this.headers() },
    );
    return this.responseBody(response, 'Failed to void payment');
  }

  private async responseBody<T>(
    response: Response,
    errorMessage: string,
  ): Promise<T> {
    if (!response.ok) {
      throw new Error(`${errorMessage} (${response.status})`);
    }
    return (await response.json()) as T;
  }

  private headers(withJsonContent = false): Record<string, string> {
    return {
      ...(withJsonContent ? { 'Content-Type': 'application/json' } : {}),
      'x-internal-api-key': this.internalApiKey,
    };
  }
}
