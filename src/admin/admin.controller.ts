import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpsertUserDto } from './dto/user-update.dto';
import { UpsertSoalDTO } from './dto/soal.dto';
import { Roles } from 'decorator/role';
import { UseAuth } from 'decorator/auth';
import { PaginationQueryDto } from 'src/dto/pagination.dto';

@Controller('admin')
// @Roles('ADMIN')
@ApiTags('admin')
// @UseAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @Get('users')
  getAllUsers(@Query() query : PaginationQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User detail' })
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: UpsertUserDto })
  @ApiResponse({ status: 201, description: 'User created' })
  @Post('users')
  createUser(@Body() data: UpsertUserDto) {
    return this.adminService.createUser(data);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpsertUserDto })
  @ApiResponse({ status: 200, description: 'User updated' })
  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() data: UpsertUserDto) {
    return this.adminService.updateUser(id, data);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Delete user result' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User result deleted' })
  @Delete('users/:id/result')
  deleteUserResult(@Param('id') id: string) {
    return this.adminService.deleteUserResult(id);
  }

  @ApiOperation({ summary: 'Get all soal' })
  @ApiResponse({ status: 200, description: 'List of soal' })
  @Get('soal')
  getAllSoal(@Query() query : PaginationQueryDto) {
    return this.adminService.getAllSoal(query);
  }

  @ApiOperation({ summary: 'Get soal by ID' })
  @ApiParam({ name: 'id', description: 'Soal ID' })
  @ApiResponse({ status: 200, description: 'Soal detail' })
  @Get('soal/:id')
  getSoalById(@Param('id') id: string) {
    return this.adminService.getSoalById(id);
  }

  @ApiOperation({ summary: 'Create soal' })
  @ApiBody({ type: UpsertSoalDTO })
  @ApiResponse({ status: 201, description: 'Soal created' })
  @Post('soal')
  createSoal(@Body() data: UpsertSoalDTO) {
    return this.adminService.createSoal(data);
  }

  @ApiOperation({ summary: 'Update soal' })
  @ApiParam({ name: 'id', description: 'Soal ID' })
  @ApiBody({ type: UpsertSoalDTO })
  @ApiResponse({ status: 200, description: 'Soal updated' })
  @Put('soal/:id')
  updateSoal(@Param('id') id: string, @Body() data: UpsertSoalDTO) {
    return this.adminService.updateSoal(id, data);
  }

  @ApiOperation({ summary: 'Delete soal' })
  @ApiParam({ name: 'id', description: 'Soal ID' })
  @ApiResponse({ status: 200, description: 'Soal deleted' })
  @Delete('soal/:id')
  deleteSoal(@Param('id') id: string) {
    return this.adminService.deleteSoal(id);
  }
}
