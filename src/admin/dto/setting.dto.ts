import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString, IsObject } from 'class-validator';

export class SettingDto {

    @ApiProperty({
        type: 'object',
        additionalProperties: { type: 'string' },
        example: { key1: 'value1', key2: 'value2' }
    })
    @IsObject()
    data: { [key: string]: string };
}