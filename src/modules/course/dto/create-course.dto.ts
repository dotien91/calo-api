import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { CourseLabel, CourseLevel, CoursePublicStatus, CourseSkill, CourseType } from "../interfaces/course.interface";
export class CreateCourseDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  title: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  @IsDefined()
  description: string;

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
  @IsDefined()
  @ApiPropertyOptional()
  type: CourseType;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  coupon_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  organization_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  price_id?: string;
}
