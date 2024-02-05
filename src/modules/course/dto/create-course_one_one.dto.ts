import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export interface CourseCalendar {
  day: number;
  time_start: string;
  time_end: string;
}

export class CreateCourseOneOneTeacherDto {
  @IsString()
  @ApiProperty()
  user_id: string;

  @IsArray()
  @ApiProperty()
  time_available: CourseCalendar[];
}

export class CreateCourseOneOneStudentDto {
  @IsString()
  @ApiProperty()
  user_id: string;

  @IsString()
  @ApiProperty()
  course_id: string;

  @IsArray()
  @ApiProperty()
  time_pick: CourseCalendar[];
}
