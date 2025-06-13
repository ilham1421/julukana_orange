import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray } from 'class-validator';

export class UpsertSoalDTO {
  @ApiProperty({ example: 'What is 2 + 2?', description: 'The question text' })
  @IsString()
  question: string;

  @ApiProperty({ example: 1, description: 'The index of the correct answer' })
  @IsNumber()
  answer: number;

  @ApiProperty({ example: ['2', '3', '4', '5'], description: 'List of options' })
  @IsArray()
  @IsString({ each: true })
  options: string[];
}