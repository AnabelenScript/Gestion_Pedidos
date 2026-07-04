import { Controller, Get, Param, Post, Body, Delete, HttpCode } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ReserveStockDto } from './dtos/reserve-stock.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':sku')
  @ApiOperation({ summary: 'Consultar stock disponible' })
  getStock(@Param('sku') sku: string) {
    return this.inventoryService.getStock(sku);
  }

  @Post('reservations')
  @ApiOperation({ summary: 'Crear reserva de inventario' })
  reserveStock(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }

  @Post('reservations/:id/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirmar reserva' })
  confirmReservation(@Param('id') id: string) {
    return this.inventoryService.confirmReservation(id);
  }

  @Delete('reservations/:id')
  @ApiOperation({ summary: 'Liberar reserva' })
  cancelReservation(@Param('id') id: string) {
    return this.inventoryService.cancelReservation(id);
  }
}
