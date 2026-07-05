import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  ApiTags,
  ApiOperation,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProductResponseDto } from './dtos/inventory-response.dto';
import { InternalApiKeyGuard } from '../auth/internal-api-key.guard';

@ApiTags('Inventory')
@ApiSecurity('internal-api-key')
@ApiUnauthorizedResponse({ description: 'API key interna ausente o inválida' })
@UseGuards(InternalApiKeyGuard)
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
