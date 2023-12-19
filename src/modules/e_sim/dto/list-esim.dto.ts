import {
  IsDate,
  IsNumberString,
  IsEmpty,
  IsIn,
  IsDefined,
  ValidateIf,
  IsOptional,
  IsString,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ListEsimDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiProperty()
  order_by: "DESC" | "ASC";

  @IsIn(["download", "time"])
  @ApiProperty()
  @IsOptional(null)
  order_type: "download" | "time";

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  country: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  country_code: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  supported_countries: string;
}
