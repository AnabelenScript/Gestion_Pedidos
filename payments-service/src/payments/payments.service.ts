import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { AuthorizePaymentDto } from './dtos/authorize-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {}

  async authorizePayment(dto: AuthorizePaymentDto) {
    if (dto.amount > 10000) {
      throw new BadRequestException('Amount too high, payment rejected');
    }

    const payment = this.paymentRepo.create({
      orderId: dto.orderId,
      amount: dto.amount,
      status: 'AUTHORIZED'
    });
    return this.paymentRepo.save(payment);
  }

  async voidPayment(paymentId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    
    payment.status = 'VOIDED';
    return this.paymentRepo.save(payment);
  }

  async getPayment(paymentId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
