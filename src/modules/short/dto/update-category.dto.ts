import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateCategoryDto } from "./create-category.dto";

export class UpdateCategoryDto extends CreateCategoryDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_language: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  category_content: string;

  @IsString()
  @IsOptional(null)
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
  category_slug: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  seo_description: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  seo_keyword: string;
}
