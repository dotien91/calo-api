import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export interface CourseCalendar {
  time_duration: number;
  day: number;
  time_start: string;
}

export class UpdateCourseClassDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsArray()
  @ApiPropertyOptional()
  course_calendars: CourseCalendar[];

  @IsString()
  @ApiPropertyOptional()
  name: string;

  @IsNumber()
  @ApiPropertyOptional()
  limit_member: number;

  @IsString()
  @ApiPropertyOptional()
  start_time: string;

  @IsString()
  @ApiPropertyOptional()
  end_time: string;
}
