import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn, IsJSON } from "class-validator";

export class UpdatePostPromptDto {
  @IsString()
  @IsOptional(null)
  @ApiProperty()
  _id?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  text_to_view?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  text_to_ai?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  text_to_image?: string;

  @IsJSON()
  @ApiProperty()
  placeholder?: any;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_language?: string;

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
  post_avatar?: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  post_type?: string;
}
