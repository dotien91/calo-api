import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsIn, IsNumberString, IsOptional } from "class-validator";
import { CourseSkill, CourseTutorSortBy, CourseType, TutorLevel } from "../interfaces/course.interface";

export class ListTutorDto {
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

  @IsEnum(CourseTutorSortBy)
  @IsOptional(null)
  @ApiPropertyOptional()
  sort_by?: CourseTutorSortBy;

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

  @IsArray()
  @IsOptional(null)
  @ApiPropertyOptional()
  timeAvailable?: TimeAvailable[];

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  onlyEnglishNativeSpeakers?: boolean;

  @IsArray()
  @IsEnum(TutorLevel, { each: true })
  @IsOptional(null)
  @ApiPropertyOptional()
  levelOfTutor: TutorLevel[];
}

export interface TimeAvailable {
  time_start: string;
  time_end: string;
}

