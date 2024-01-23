import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export interface CourseCalendar {
  day: number;
  time_start: string;
  time_end: string;
}

export class UpdateCourseCalendarTeacherDto {
  @IsString()
  @ApiProperty()
  course_id: string;

  @IsString()
  @ApiProperty()
  user_id: string;

  @IsArray()
  @ApiProperty()
  time_available: CourseCalendar[];
}

