import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsDate,
  IsDefined,
  IsIn,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";
import { CreateUserDto } from "./create-user.dto";
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_cover?: string;

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_avatar?: string;

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_avatar_thumbnail?: string;

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_sound?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  display_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bio?: string;

  @IsBooleanString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_validated_phone?: any;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  old_password?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  phone_number?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_password?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_address?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_role?: string;

  @IsDate()
  @IsOptional(null)
  @ApiPropertyOptional()
  last_active?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  travel_city?: string;

  @IsNumberString()
  @IsOptional(null)
  @IsIn(["0"])
  @ApiPropertyOptional()
  user_status?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_avatar?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  phone_session?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  official_status?: boolean;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  links?: any;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  certificates?: Array<UserCertificate>;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  educations?: Array<UserEducation>;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  is_native?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  is_verified?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  tutor_level?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  badge?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  organization_id?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  default_language?: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  user_payment_address?: string[];

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  taught_time?: number;
}

export interface UserCertificate {
  name: string;
  place_of_issue: string;
  date_of_issue: string;
  is_validated: boolean;
}

export interface UserEducation {
  name: string;
  start_time: string;
  end_time: string;
}

export class ApproveTutorPayload {
  @IsString()
  @IsDefined()
  _id: string;
}

export class RejectTutorPayload {
  @IsString()
  @IsDefined()
  _id: string;
}
