import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Reservation } from './entities/reservation.entity';
import { ReserveStockDto } from './dtos/reserve-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Reservation) private reservationRepo: Repository<Reservation>,
  ) {}

  async getStock(sku: string) {
    const product = await this.productRepo.findOne({ where: { sku } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async reserveStock(dto: ReserveStockDto) {
    const product = await this.getStock(dto.sku);
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    product.stock -= dto.quantity;
    await this.productRepo.save(product);

    const reservation = this.reservationRepo.create({
      orderId: dto.orderId,
      sku: dto.sku,
      quantity: dto.quantity,
      status: 'PENDING'
    });
    return this.reservationRepo.save(reservation);
  }

  async confirmReservation(reservationId: string) {
    const reservation = await this.reservationRepo.findOne({ where: { id: reservationId } });
    if (!reservation) throw new NotFoundException('Reservation not found');
    
    reservation.status = 'CONFIRMED';
    return this.reservationRepo.save(reservation);
  }

  async cancelReservation(reservationId: string) {
    const reservation = await this.reservationRepo.findOne({ where: { id: reservationId } });
    if (!reservation) throw new NotFoundException('Reservation not found');
    
    if (reservation.status !== 'CANCELLED') {
        const product = await this.getStock(reservation.sku);
        product.stock += reservation.quantity;
        await this.productRepo.save(product);
        
        reservation.status = 'CANCELLED';
        await this.reservationRepo.save(reservation);
    }
    return reservation;
  }
}
