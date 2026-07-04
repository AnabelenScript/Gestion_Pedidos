import { IsString, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  sku: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export enum PaymentMethod {
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
}

class PaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsString()
  token: string;
}

export class CreateOrderDto {
  @IsString()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => PaymentDto)
  payment: PaymentDto;
}
