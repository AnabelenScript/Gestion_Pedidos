import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { SagaService } from '../saga/saga.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly sagaService: SagaService,
    private readonly redisService: RedisService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const order = await this.orderRepo.save(
      this.orderRepo.create({
        userId,
        sku: dto.sku,
        quantity: dto.quantity,
        totalAmount: null,
        status: OrderStatus.PENDING,
        reservationId: null,
        paymentId: null,
        failureReason: null,
      }),
    );

    try {
      const reservation = await this.sagaService.reserveInventory(
        order.id,
        dto.sku,
        dto.quantity,
      );
      order.reservationId = reservation.id;
      order.totalAmount = this.calculateTotal(
        reservation.unitPrice,
        dto.quantity,
      );
      order.status = OrderStatus.INVENTORY_RESERVED;
      await this.orderRepo.save(order);

      const payment = await this.sagaService.authorizePayment(
        order.id,
        order.totalAmount,
      );
      order.paymentId = payment.id;
      order.status = OrderStatus.PAYMENT_AUTHORIZED;
      await this.orderRepo.save(order);

      await this.sagaService.confirmInventoryReservation(reservation.id);
      order.status = OrderStatus.CONFIRMED;
      order.failureReason = null;
      await this.orderRepo.save(order);

      await this.publishEvent('order.confirmed', {
        orderId: order.id,
        reservationId: order.reservationId,
        paymentId: order.paymentId,
        sku: order.sku,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
      });
      return order;
    } catch (error: unknown) {
      const reason = this.errorMessage(error);
      const compensationErrors = await this.compensate(order);
      await this.finishCancellation(order, reason, compensationErrors);
      await this.publishCancellation(order, reason);

      throw new BadRequestException(
        compensationErrors.length
          ? `Saga failed: ${reason}. Compensation incomplete`
          : `Saga failed: ${reason}`,
      );
    }
  }

  async getOrder(userId: string, id: string) {
    const order = await this.orderRepo.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancelOrder(userId: string, id: string) {
    const order = await this.getOrder(userId, id);
    if (order.status === OrderStatus.CANCELLED) return order;
    if (
      order.status !== OrderStatus.CONFIRMED &&
      order.status !== OrderStatus.COMPENSATION_FAILED
    ) {
      throw new ConflictException(
        `Order cannot be cancelled from status ${order.status}`,
      );
    }

    const compensationErrors = await this.compensate(order);
    await this.finishCancellation(
      order,
      'Order cancelled by user',
      compensationErrors,
    );
    await this.publishCancellation(order, 'Order cancelled by user');

    if (compensationErrors.length) {
      throw new ServiceUnavailableException(
        'Order cancellation requires compensation retry',
      );
    }
    return order;
  }

  private async compensate(order: Order): Promise<string[]> {
    const errors: string[] = [];
    order.status = OrderStatus.COMPENSATING;
    try {
      await this.orderRepo.save(order);
    } catch (error: unknown) {
      errors.push(`state: ${this.errorMessage(error)}`);
    }

    if (order.paymentId) {
      try {
        await this.sagaService.voidPayment(order.paymentId);
      } catch (error: unknown) {
        errors.push(`payment: ${this.errorMessage(error)}`);
      }
    }
    if (order.reservationId) {
      try {
        await this.sagaService.cancelInventoryReservation(order.reservationId);
      } catch (error: unknown) {
        errors.push(`inventory: ${this.errorMessage(error)}`);
      }
    }
    return errors;
  }

  private async finishCancellation(
    order: Order,
    reason: string,
    compensationErrors: string[],
  ): Promise<void> {
    order.status = compensationErrors.length
      ? OrderStatus.COMPENSATION_FAILED
      : OrderStatus.CANCELLED;
    order.failureReason = compensationErrors.length
      ? `${reason}; ${compensationErrors.join('; ')}`
      : reason;
    await this.orderRepo.save(order);
  }

  private async publishCancellation(order: Order, reason: string) {
    await this.publishEvent('order.cancelled', {
      orderId: order.id,
      reservationId: order.reservationId,
      paymentId: order.paymentId,
      reason,
      status: order.status,
    });
  }

  private async publishEvent(channel: string, payload: unknown) {
    try {
      await this.redisService.publish(channel, payload);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to publish ${channel}: ${this.errorMessage(error)}`,
      );
    }
  }

  private calculateTotal(unitPrice: number, quantity: number): number {
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error('Inventory returned an invalid unit price');
    }
    return Math.round((unitPrice * quantity + Number.EPSILON) * 100) / 100;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
