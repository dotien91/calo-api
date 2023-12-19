import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject } from "class-validator";
export class CreateCategoryDto {
  @IsString()
  @ApiProperty()
  category_language: string;

  @IsString()
  @ApiProperty()
  category_content: string;

  @IsString()
  @ApiProperty()
  category_title: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_excerpt: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_parent: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_status: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_avatar: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_type: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  seo_title: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  seo_description: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  seo_keyword: string;
}
