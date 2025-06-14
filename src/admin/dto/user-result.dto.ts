import { ApiProperty } from "@nestjs/swagger";
import { ResultStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UserResultDto {
    @ApiProperty({ enum: ResultStatus, description: 'Status hasil penilaian', example: ResultStatus.STARTED })
    @IsEnum(ResultStatus)
    data: ResultStatus;
}