import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Identificador del usuario propietario' })
  userId: string;

  @ApiProperty({ example: 'SKU-123' })
  sku: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 1999.98 })
  totalAmount: number;

  @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;
}
