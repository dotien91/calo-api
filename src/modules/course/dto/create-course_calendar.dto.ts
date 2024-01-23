import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateCourseCalendarDto {
  @IsNumber()
  @ApiProperty()
  time_duration: number;

  @IsNumber()
  @ApiProperty()
  day: number;

  @IsString()
  @ApiProperty()
  time_start: string;

  @IsString()
  @ApiPropertyOptional()
  time_end?: string;

  @IsString()
  @ApiProperty()
  course_type: string;
}
