import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsIn, IsOptional, IsDateString, IsString, IsPhoneNumber, IsUrl, IsNumberString, IsDate, IsNumber, IsBooleanString } from 'class-validator';
import { Transform } from 'class-transformer';
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @ApiProperty()
  _id?: string

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_cover?: string

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_avatar?: string

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_avatar_square?: string

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_avatar_thumbnail?: string

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_sound?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  display_name?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bio?: string

  @IsBooleanString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_validate_phone?: any

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  old_password?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_phone?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_password?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_address?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_referrer?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_role?: string

  @IsDate()
  @IsOptional(null)
  @ApiPropertyOptional()
  last_active?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  travel_city?: string

  @IsNumberString()
  @IsOptional(null)
  @IsIn(["0"])
  @ApiPropertyOptional()
  user_status?: string

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  notification_chat?: number

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  notification_community?: number

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  notification_course?: number

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  notification_user?: number

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  message_stranger?: number

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_avatar?: number

  phone_session?: string
}
