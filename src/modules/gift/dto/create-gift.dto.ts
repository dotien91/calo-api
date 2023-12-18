import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsOptional,
  IsDateString,
  IsString,
  IsNumberString,
  IsNumber,
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsJSON,
} from "class-validator";

class DataConditionsDto {
  @IsNumberString()
  @ApiProperty()
  price: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  stock_qty: number;
}

export class CreateGiftDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description: string;

  @IsString()
  @ApiProperty()
  media_id: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsNumberString()
  @ApiProperty()
  price: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  stock_qty?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_digital_media?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_digital_url?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  priority?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_conditions?: string;
}

