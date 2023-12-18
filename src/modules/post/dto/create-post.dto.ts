import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreatePostDto {
  @IsString()
  @ApiProperty()
  post_language: string;

  @IsString()
  @ApiProperty()
  post_content: string;

  @IsString()
  @ApiProperty()
  post_title: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_excerpt: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_category: string;

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
  post_avatar: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_type: string;

  @IsJSON()
  @IsOptional(null)
  @ApiProperty()
  public_album: any;

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

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  post_view?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  money_per_post?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  total_user?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  count_user?: number;

  @IsJSON()
  @IsOptional(null)
  @ApiProperty()
  downloads?: any;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  download?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_object?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_additional: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  must_do: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_information: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  introduction: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  installation: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  social: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  follow: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  career_number: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  min_money: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  max_money: string
}
