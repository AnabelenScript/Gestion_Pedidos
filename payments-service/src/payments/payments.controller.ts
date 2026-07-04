import { Controller, Get, Param, Post, Body, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthorizePaymentDto } from './dtos/authorize-payment.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('authorize')
  @ApiOperation({ summary: 'Autorizar pago' })
  authorizePayment(@Body() dto: AuthorizePaymentDto) {
    return this.paymentsService.authorizePayment(dto);
  }

  @Post(':id/void')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancelar pago autorizado' })
  voidPayment(@Param('id') id: string) {
    return this.paymentsService.voidPayment(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar transacción' })
  getPayment(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }
}
