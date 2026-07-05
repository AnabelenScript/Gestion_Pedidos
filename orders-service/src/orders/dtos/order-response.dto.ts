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

  @ApiProperty({ example: 1999.98, nullable: true })
  totalAmount: number | null;

  @ApiProperty({
    enum: [
      'PENDING',
      'INVENTORY_RESERVED',
      'PAYMENT_AUTHORIZED',
      'CONFIRMED',
      'COMPENSATING',
      'CANCELLED',
      'COMPENSATION_FAILED',
    ],
  })
  status: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  reservationId: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  paymentId: string | null;

  @ApiProperty({ nullable: true })
  failureReason: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}
