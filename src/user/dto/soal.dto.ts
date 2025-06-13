import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";

export class JawabSoalDto {
  @IsString()
  @IsNotEmpty()
  soalId: string;

  @IsNumber()
  jawaban: number;
}

export class JawabAllSoalDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JawabSoalDto)
  jawaban: JawabSoalDto[];
}
