import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsIn,
  IsOptional,
  IsDateString,
  IsString,
  IsPhoneNumber,
  IsUrl,
  IsNumberString,
  IsJSON,
  IsDate,
  IsNumber,
} from "class-validator";
import { Transform } from "class-transformer";
import { CreateUserOptionDto } from "./create-user_option.dto";

export class UpdateUserOptionDto extends PartialType(CreateUserOptionDto) {
  @IsString()
  @ApiProperty()
  user_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_address?: string;

  // @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  sexual_content?: string;

  @IsOptional(null)
  @ApiPropertyOptional()
  user_parent_name?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_spotlight?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_role?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_birthday?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  base_height?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  instagram_token?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_instagram?: string | any[];

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  base_weight?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  base_role?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  body_type?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  relationship_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ethnicity?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  language?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  locking_for?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_album?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  private_album?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_interest?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  where_to_meet?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_job?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_department?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_nation?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  social_link?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_link?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_mood?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_gender?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  hiv_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  last_test?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ready_status?: number;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  safety_practices?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_question?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_education?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_religion?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  like_alcoholic?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  like_tobacco?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  have_children?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  living_with?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_spotify?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  token_spotify?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_spotify?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  disable_account: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  sample_message?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_number?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_account_name?: string;
}
