import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListCategoryDto {
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

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_type: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_parent: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  search: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  ids: any;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_status: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_language: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  user_id: string;
}
