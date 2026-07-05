import { Controller, Get, Param, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear pedido y ejecutar Saga orquestada' })
  createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    const userId = req.user.sub;
    return this.ordersService.createOrder(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar pedido' })
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }
}
