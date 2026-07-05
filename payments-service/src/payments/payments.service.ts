import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { AuthorizePaymentDto } from './dtos/authorize-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly dataSource: DataSource,
  ) {}

  async authorizePayment(dto: AuthorizePaymentDto) {
    if (dto.amount > 10000) {
      throw new BadRequestException('Amount too high, payment rejected');
    }

    const existing = await this.paymentRepo.findOne({
      where: { orderId: dto.orderId },
    });
    if (existing) return this.ensureSameAuthorization(existing, dto);

    try {
      return await this.paymentRepo.save(
        this.paymentRepo.create({
          orderId: dto.orderId,
          amount: dto.amount,
          status: PaymentStatus.AUTHORIZED,
        }),
      );
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        const concurrentPayment = await this.paymentRepo.findOne({
          where: { orderId: dto.orderId },
        });
        if (concurrentPayment) {
          return this.ensureSameAuthorization(concurrentPayment, dto);
        }
      }
      throw error;
    }
  }

  async voidPayment(paymentId: string) {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Payment);
      const payment = await repository.findOne({
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status === PaymentStatus.VOIDED) return payment;

      payment.status = PaymentStatus.VOIDED;
      return repository.save(payment);
    });
  }

  async getPayment(paymentId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  private ensureSameAuthorization(
    payment: Payment,
    dto: AuthorizePaymentDto,
  ): Payment {
    if (this.toCents(payment.amount) !== this.toCents(dto.amount)) {
      throw new ConflictException(
        'Order already has a payment with a different amount',
      );
    }
    if (payment.status === PaymentStatus.VOIDED) {
      throw new ConflictException('Voided payment cannot be authorized again');
    }
    return payment;
  }

  private toCents(amount: number): number {
    return Math.round(amount * 100);
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
