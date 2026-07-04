import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Order } from '../orders/entities/order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SagaService {
  constructor(private readonly redisService: RedisService) {}

  async startOrderSaga(order: Order, paymentData: any) {
    // According to architecture:
    // Orders Service -> Inventory Service (REST: Reservar stock)
    // Orders Service -> Payments Service (REST: Autorizar pago)
    // Here we simulate the REST calls and then publish the success/failure event

    try {
      console.log(`[Saga] Simulando llamada a Inventory Service (POST /reservations)...`);
      order.reservationId = `res-${uuidv4().substring(0, 8)}`;

      console.log(`[Saga] Simulando llamada a Payments Service (POST /payments/authorize)...`);
      order.paymentId = `pay-${uuidv4().substring(0, 8)}`;

      // Si todo sale bien, publicar order.confirmed
      const payload = {
        eventId: uuidv4(),
        eventType: 'order.confirmed',
        occurredAt: new Date().toISOString(),
        data: {
          orderId: order.orderId,
          reservationId: order.reservationId,
          customerId: order.customerId,
          total: order.total,
          items: order.items?.map(i => ({ sku: i.sku, quantity: i.quantity })) || [],
        }
      };
      await this.redisService.publish('orders', payload);
      console.log(`[Saga] Evento publicado: order.confirmed para ${order.orderId}`);

    } catch (error: any) {
      // Si falla, iniciar compensación
      console.log(`[Saga] Error en Saga para la orden ${order.orderId}. Compensando...`);
      await this.compensateOrderCancelled(order, error.message);
    }
  }

  async compensateOrderCancelled(order: Order, reason: string = 'User Cancelled o fallo en saga') {
    const payload = {
      eventId: uuidv4(),
      eventType: 'order.cancelled',
      occurredAt: new Date().toISOString(),
      data: {
        orderId: order.orderId,
        reservationId: order.reservationId,
        reason
      }
    };
    await this.redisService.publish('orders', payload);
    console.log(`[Saga] Evento publicado (Compensación): order.cancelled para ${order.orderId}`);
  }
}
