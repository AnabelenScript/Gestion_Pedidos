import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { OrderResponseDto } from './dtos/order-response.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
@UseGuards(JwtGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear pedido y ejecutar Saga orquestada' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o fallo durante la Saga',
  })
  createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    const userId = req.user.sub;
    return this.ordersService.createOrder(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar pedido' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Pedido no encontrado' })
  getOrder(@Request() req, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.ordersService.getOrder(req.user.sub, id);
  }
}
