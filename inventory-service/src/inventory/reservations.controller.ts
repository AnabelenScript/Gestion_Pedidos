import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { ReserveStockDto } from './dtos/reserve-stock.dto';
import { ReservationResponseDto } from './dtos/inventory-response.dto';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Crear reserva de inventario' })
  @ApiCreatedResponse({ type: ReservationResponseDto })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o stock insuficiente',
  })
  @ApiNotFoundResponse({ description: 'Producto no encontrado' })
  reserveStock(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }

  @Post(':id/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirmar reserva' })
  @ApiOkResponse({ type: ReservationResponseDto })
  @ApiNotFoundResponse({ description: 'Reserva no encontrada' })
  confirmReservation(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.inventoryService.confirmReservation(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Liberar reserva' })
  @ApiOkResponse({ type: ReservationResponseDto })
  @ApiNotFoundResponse({ description: 'Reserva no encontrada' })
  cancelReservation(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.inventoryService.cancelReservation(id);
  }
}
