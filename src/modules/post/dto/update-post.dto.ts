import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn, IsJSON, IsNumberString } from "class-validator";

export class UpdatePostDto {
  @IsString()
  @IsOptional(null)
  @ApiProperty()
  _id?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_title?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_content?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_language?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_slug?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_excerpt?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_category?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_parent?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  other_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_avatar?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_type?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  post_view?: number;

  @IsJSON()
  @IsOptional(null)
  @ApiProperty()
  public_album?: any;

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
  seo_title?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  seo_description?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  seo_keyword?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  image_public?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_object?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_additional?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  must_do?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_information?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  introduction?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  installation?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  social?: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  follow?: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  career_number?: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  min_money?: string

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  max_money?: string

  user_entity?: any
}
