import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertUserDto {
  @ApiPropertyOptional({ example: 'Budi Santoso', description: 'Nama lengkap user' })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiPropertyOptional({ example: '123456789', description: 'NIP user' })
  @IsOptional()
  @IsString()
  nip?: string;
}