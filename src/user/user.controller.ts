import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JawabAllSoalDto } from './dto/soal.dto';
import { UseAuth } from 'decorator/auth';
import { Roles } from 'decorator/role';
import { User } from 'decorator/user';
import { UserSession } from 'types/auth';

@UseAuth()
@Controller('user')
@ApiTags('user')
@Roles("USER")
export class UserController {
  constructor(private readonly userService: UserService) { }


  @ApiOperation({ summary: 'Get all soal' })
  @ApiResponse({ status: 200, description: 'List of soal' })
  @Get('soal')
  async getAllSoal() {
    return this.userService.getAllSoal();
  }

  @ApiOperation({ summary: 'Jawab semua soal' })
  @ApiBody({ type: JawabAllSoalDto })
  @ApiResponse({ status: 200, description: 'Score' })
  @Post('jawab')
  async jawabAllSoal(
    @Body() body: JawabAllSoalDto,
    @User() user: UserSession,
  ) {
    return this.userService.jawabAllSoal(user.id, body.jawaban);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, description: 'Array of settings', type: [Array] })
  async getAllSettings() {
    return await this.userService.getAllSettings();
  }

  @Get("mulai")
  @ApiOperation({ summary: 'Mulai ujian' })
  @ApiResponse({ status: 200, description: 'Mulai ujian' })
  async mulaiUjian(@User() user : UserSession) {
    return await this.userService.createUserResult(user.id);
  }


}
