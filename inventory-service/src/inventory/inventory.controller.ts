import { Controller, Get, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  ApiTags,
  ApiOperation,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ProductResponseDto } from './dtos/inventory-response.dto';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':sku')
  @ApiOperation({ summary: 'Consultar stock disponible' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Producto no encontrado' })
  getStock(@Param('sku') sku: string) {
    return this.inventoryService.getStock(sku);
  }
}
