import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UseAuth } from 'decorator/auth';
import { User } from 'decorator/user';
import { UserSession } from 'types/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() data : LoginDto) {
    return this.authService.login(data.nama, data.nip, data.client_secret);
  }

  @Get()
  @UseAuth()
  authUser(@User() user : UserSession) {
    return user
  }
}
