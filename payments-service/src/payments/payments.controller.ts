import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthorizePaymentDto } from './dtos/authorize-payment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { PaymentResponseDto } from './dtos/payment-response.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('authorize')
  @ApiOperation({ summary: 'Autorizar pago' })
  @ApiCreatedResponse({ type: PaymentResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos o pago rechazado' })
  authorizePayment(@Body() dto: AuthorizePaymentDto) {
    return this.paymentsService.authorizePayment(dto);
  }

  @Post(':id/void')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancelar pago autorizado' })
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiNotFoundResponse({ description: 'Pago no encontrado' })
  voidPayment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.paymentsService.voidPayment(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar transacción' })
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiNotFoundResponse({ description: 'Pago no encontrado' })
  getPayment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.paymentsService.getPayment(id);
  }
}
