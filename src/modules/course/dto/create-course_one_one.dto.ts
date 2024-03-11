import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDefined, IsNumber, IsString, ValidateNested } from "class-validator";

export class CourseCalendar {
  @IsNumber()
  @IsDefined()
  day: number;

  @IsString()
  @IsDefined()
  time_start: string;

  @IsString()
  @IsDefined()
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
  @ValidateNested({ each: true })
  @Type(() => CourseCalendar)
  time_pick: CourseCalendar[];
}
