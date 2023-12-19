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

export class ListPostDto {
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
  post_type: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_category: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  search: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_parent: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_status: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  other_status: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_language: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  not_download: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  not_image: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  user_id: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  prompt_id: string;

  @IsDateString()
  @IsOptional(null)
  from?: string;
}
