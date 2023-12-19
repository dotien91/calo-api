import {
  IsDate,
  IsNumberString,
  IsEmpty,
  IsIn,
  IsDefined,
  ValidateIf,
  IsOptional,
  IsString,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Date } from "mongoose";

export class ListChannelPermissionDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by: "DESC" | "ASC";

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  order_type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_level: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_role: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  permission: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  official_status: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  auth_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_not_mentor: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from_mentor: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from_user: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  course_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  mentor_role: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  unset?: any;

  successed_at?: Date;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_not_from_mentor: string;
}
