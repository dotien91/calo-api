import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsIn, IsNumberString, IsJSON, IsArray } from 'class-validator';
import { CreateChannelDto } from './create-channel.dto';
import { ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @IsString()
  @ApiProperty()
  _id: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  note?: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  ios_link?: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  android_link?: string

  @IsJSON()
  @ApiPropertyOptional()
  @IsOptional(null)
  point_data?: string

  @IsNumberString()
  @ApiPropertyOptional()
  @IsOptional(null)
  official_status?: number

  @IsJSON()
  @ApiPropertyOptional()
  @IsOptional(null)
  service_id?: string

  @IsJSON()
  @ApiPropertyOptional()
  @IsOptional(null)
  payment_method?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  domain?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  domain_id?: string

  @IsArray()
  @IsOptional(null)
  @ApiPropertyOptional()
  name_servers?: Array<string>

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  data_config?: string
}
