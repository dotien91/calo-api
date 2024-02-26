import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { CourseLevel, CourseSkill, CourseSortBy, CourseType } from "../interfaces/course.interface";

export class ListCourseDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC" | "ASC";

  @IsEnum(CourseSortBy)
  @IsOptional(null)
  @ApiPropertyOptional()
  sort_by?: CourseSortBy;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  auth_id?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  min_price?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  max_price?: string;

  @IsArray()
  @IsEnum(CourseLevel, { each: true })
  @IsOptional(null)
  @ApiPropertyOptional()
  levels?: CourseLevel[];

  @IsArray()
  @IsEnum(CourseSkill, { each: true })
  @IsOptional(null)
  @ApiPropertyOptional()
  skills?: CourseSkill[];

  @IsArray()
  @IsEnum(CourseType, { each: true })
  @IsOptional(null)
  @ApiPropertyOptional()
  types?: CourseType[];

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  onlyEnglishNativeSpeakers?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  user_id?: string;
}

export class ListSaleCourseDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC" | "ASC";

  @IsEnum(CourseSortBy)
  @IsOptional(null)
  @ApiPropertyOptional()
  sort_by?: CourseSortBy;

  @IsString()
  @IsOptional()
  coupon_id?: string;

  @IsBoolean()
  @IsOptional()
  is_sale?: boolean;

  @IsString()
  @IsOptional()
  user_id?: string;
}

export class GetCourseRoomParams {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  user_id: string;

  @IsString()
  @IsDefined()
  @ApiProperty()
  course_id: string;
}
