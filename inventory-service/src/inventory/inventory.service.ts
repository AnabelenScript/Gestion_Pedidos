import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { ReserveStockDto } from './dtos/reserve-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    private readonly dataSource: DataSource,
  ) {}

  async getStock(sku: string) {
    const product = await this.productRepo.findOne({ where: { sku } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async seedDemoProducts() {
    await this.productRepo
      .createQueryBuilder()
      .insert()
      .values([
        { sku: 'SKU-123', name: 'Laptop', stock: 100, unitPrice: 999.99 },
        { sku: 'SKU-456', name: 'Mouse', stock: 50, unitPrice: 29.99 },
      ])
      .orIgnore()
      .execute();
  }

  async reserveStock(dto: ReserveStockDto) {
    const existing = await this.reservationRepo.findOne({
      where: { orderId: dto.orderId },
    });
    if (existing) return this.ensureSameRequest(existing, dto);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const productRepo = manager.getRepository(Product);
        const reservationRepo = manager.getRepository(Reservation);
        const product = await productRepo.findOne({
          where: { sku: dto.sku },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) throw new NotFoundException('Product not found');

        const concurrentReservation = await reservationRepo.findOne({
          where: { orderId: dto.orderId },
        });
        if (concurrentReservation) {
          return this.ensureSameRequest(concurrentReservation, dto);
        }
        if (product.stock < dto.quantity) {
          throw new BadRequestException('Not enough stock');
        }

        product.stock -= dto.quantity;
        await productRepo.save(product);

        return reservationRepo.save(
          reservationRepo.create({
            orderId: dto.orderId,
            sku: dto.sku,
            quantity: dto.quantity,
            unitPrice: product.unitPrice,
            status: ReservationStatus.PENDING,
          }),
        );
      });
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        const concurrentReservation = await this.reservationRepo.findOne({
          where: { orderId: dto.orderId },
        });
        if (concurrentReservation) {
          return this.ensureSameRequest(concurrentReservation, dto);
        }
      }
      throw error;
    }
  }

  async confirmReservation(reservationId: string) {
    return this.dataSource.transaction(async (manager) => {
      const reservation = await this.lockReservation(manager, reservationId);
      if (reservation.status === ReservationStatus.CONFIRMED)
        return reservation;
      if (reservation.status === ReservationStatus.CANCELLED) {
        throw new ConflictException(
          'Cancelled reservation cannot be confirmed',
        );
      }

      reservation.status = ReservationStatus.CONFIRMED;
      return manager.getRepository(Reservation).save(reservation);
    });
  }

  async cancelReservation(reservationId: string) {
    return this.dataSource.transaction(async (manager) => {
      const reservation = await this.lockReservation(manager, reservationId);
      if (reservation.status === ReservationStatus.CANCELLED)
        return reservation;

      const productRepo = manager.getRepository(Product);
      const product = await productRepo.findOne({
        where: { sku: reservation.sku },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product) throw new NotFoundException('Product not found');

      product.stock += reservation.quantity;
      await productRepo.save(product);
      reservation.status = ReservationStatus.CANCELLED;
      return manager.getRepository(Reservation).save(reservation);
    });
  }

  private async lockReservation(
    manager: EntityManager,
    reservationId: string,
  ): Promise<Reservation> {
    const reservation = await manager.getRepository(Reservation).findOne({
      where: { id: reservationId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }

  private ensureSameRequest(
    reservation: Reservation,
    dto: ReserveStockDto,
  ): Reservation {
    if (reservation.sku !== dto.sku || reservation.quantity !== dto.quantity) {
      throw new ConflictException(
        'Order already has a reservation with different data',
      );
    }
    return reservation;
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
