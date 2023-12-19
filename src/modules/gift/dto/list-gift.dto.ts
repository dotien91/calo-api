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
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListGiftDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  order_type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  point: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  level: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  like: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  comment: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  course: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  birth: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  coin: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  stock_qty: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  date_time: string;
}
