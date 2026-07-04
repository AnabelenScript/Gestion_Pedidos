import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { SagaService } from '../saga/saga.service';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly sagaService: SagaService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Calcular el total
    const total = createOrderDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    // Crear la entidad
    const order = this.orderRepository.create({
      customerId: createOrderDto.customerId,
      total,
      status: OrderStatus.PENDING,
      items: createOrderDto.items.map(item => {
        const orderItem = new OrderItem();
        orderItem.sku = item.sku;
        orderItem.quantity = item.quantity;
        orderItem.unitPrice = item.unitPrice;
        return orderItem;
      }),
    });

    // Guardar en base de datos local
    const savedOrder = await this.orderRepository.save(order);

    // Iniciar la saga (asíncrono)
    this.sagaService.startOrderSaga(savedOrder, createOrderDto.payment);

    return savedOrder;
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return order;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    
    if (order.status === OrderStatus.CANCELLED) {
      return order; // Ya estaba cancelada
    }

    order.status = OrderStatus.CANCELLED;
    const updatedOrder = await this.orderRepository.save(order);

    // Ejecutar compensación en la Saga si es necesario
    this.sagaService.compensateOrderCancelled(updatedOrder);

    return updatedOrder;
  }
}
