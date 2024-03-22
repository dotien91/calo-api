import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsDefined,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { CourseLabel, CourseLevel, CoursePublicStatus, CourseSkill, CourseType } from "../interfaces/course.interface";

export class UpdateCourseDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  _id: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  long_description?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  avatar?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  end_time?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  price?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  country?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  version?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  product_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: CoursePublicStatus;

  @IsArray()
  @IsEnum(CourseLabel, { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  labels?: CourseLabel[];

  @IsString()
  @IsEnum(CourseLevel)
  @IsOptional()
  @ApiPropertyOptional()
  level?: CourseLevel;

  @IsArray()
  @IsEnum(CourseSkill, { each: true })
  @IsOptional()
  @ApiPropertyOptional()
  skills?: CourseSkill[];

  @IsString()
  @IsEnum(CourseType)
  @IsOptional()
  @ApiPropertyOptional()
  type?: CourseType;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  coupon_id?: string;

  @IsNumber()
  @IsOptional(null)
  @ApiPropertyOptional()
  rating?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  price_id?: string;
}
