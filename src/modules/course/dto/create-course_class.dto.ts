import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDefined, IsNumber, IsString } from "class-validator";

export interface CourseCalendar {
  time_duration: number;
  day: number;
  time_start: string;
}

export class CreateCourseClassDto {
  @IsString()
  @ApiProperty()
  course_id: string;

  @IsArray()
  @ApiProperty()
  course_calendars: CourseCalendar[];

  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @ApiProperty()
  limit_member: number;

  @IsString()
  @ApiProperty()
  start_time: string;

  @IsString()
  @ApiProperty()
  end_time: string;
}

export class AddMemberCourseClassDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  class_id: string;

  @IsString()
  @IsDefined()
  @ApiProperty()
  user_id: string;
}

export class RemoveMemberCourseClassDto {
  @IsString()
  @ApiProperty()
  class_id: string;

  @IsString()
  @ApiProperty()
  user_id: string;
}
