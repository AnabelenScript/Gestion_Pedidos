import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

class LoginDto {
  @ApiProperty({ example: 'user-123', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  userId: string;
}

class LoginResponseDto {
  @ApiProperty({ description: 'Token JWT de acceso' })
  access_token: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Generar token JWT para pruebas' })
  @ApiOkResponse({ type: LoginResponseDto })
  login(@Body() loginDto: LoginDto) {
    return this.authService.generateToken(loginDto.userId);
  }
}
