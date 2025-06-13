import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JawabAllSoalDto } from './dto/soal.dto';

@Controller('user')
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
    @Query('userId') userId: string,
  ) {
    return this.userService.jawabAllSoal(userId, body.jawaban);
  }
}
