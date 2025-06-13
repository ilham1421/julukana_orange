import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpsertUserDto {
  @ApiPropertyOptional({ example: 'Budi Santoso', description: 'Nama lengkap user' })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiPropertyOptional({ example: '123456789', description: 'NIP user' })
  @IsOptional()
  @IsString()
  nip?: string;

  
  @ApiPropertyOptional({ example: 'ADMIN', enum: Role, description: 'Role user' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}


export class CreateUserDto {
  @ApiProperty({ example: 'Budi Santoso', description: 'Nama lengkap user' })
  @IsString()
  nama: string;

  @ApiProperty({ example: '123456789', description: 'NIP user' })
  @IsString()
  nip: string;

  @ApiProperty({ example: 'ADMIN', enum: Role, description: 'Role user' })
  @IsEnum(Role)
  role: Role;
}