import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'SKU-123' })
  sku: string;

  @ApiProperty({ example: 'Laptop' })
  name: string;

  @ApiProperty({ example: 100 })
  stock: number;

  @ApiProperty({ example: 999.99 })
  unitPrice: number;
}

export class ReservationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  orderId: string;

  @ApiProperty({ example: 'SKU-123' })
  sku: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 999.99 })
  unitPrice: number;

  @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;
}
