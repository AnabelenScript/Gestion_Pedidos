import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';

class LoginDto {
  @ApiProperty()
  userId: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Generar token JWT para pruebas' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.generateToken(loginDto.userId);
  }
}
