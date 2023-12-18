import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListChannelMeDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from_url: string;
}
