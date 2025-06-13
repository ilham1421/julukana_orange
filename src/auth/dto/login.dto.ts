import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ example: 'John Doe', description: 'Nama user' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  nama: string;

  @ApiProperty({ example: '12345678', description: 'NIP user' })
  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  @Transform(({ value }) => value.trim())
  nip: string;

  @ApiProperty({ example: 'abcdef123456', description: 'Client secret (public key)' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  client_secret: string;
}