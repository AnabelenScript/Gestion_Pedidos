import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthorizePaymentDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;
}
