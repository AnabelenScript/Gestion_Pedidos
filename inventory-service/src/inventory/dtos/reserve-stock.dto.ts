import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReserveStockDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}
