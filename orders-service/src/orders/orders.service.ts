import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { SagaService } from '../saga/saga.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private sagaService: SagaService,
    private redisService: RedisService
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const order = this.orderRepo.create({
      userId,
      sku: dto.sku,
      quantity: dto.quantity,
      totalAmount: dto.totalAmount,
      status: 'PENDING'
    });
    await this.orderRepo.save(order);

    let reservation: any;
    try {
      reservation = await this.sagaService.reserveInventory(order.id, dto.sku, dto.quantity);
      await this.sagaService.authorizePayment(order.id, dto.totalAmount);
      await this.sagaService.confirmInventoryReservation(reservation.id);

      order.status = 'CONFIRMED';
      await this.orderRepo.save(order);
      
      this.redisService.publish('order.confirmed', { orderId: order.id, sku: order.sku, quantity: order.quantity });
      
      return order;
    } catch (error: any) {
      if (reservation) {
        await this.sagaService.cancelInventoryReservation(reservation.id);
      }
      
      order.status = 'CANCELLED';
      await this.orderRepo.save(order);
      
      this.redisService.publish('order.cancelled', { orderId: order.id, reason: error.message });
      
      throw new BadRequestException('Saga failed: ' + error.message);
    }
  }

  async getOrder(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
