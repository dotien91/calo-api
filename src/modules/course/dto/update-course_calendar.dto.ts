import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class UpdateCourseCalendarDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsNumber()
  @ApiPropertyOptional()
  day?: number;

  @IsNumber()
  @ApiPropertyOptional()
  time_duration?: number;

  @IsString()
  @ApiPropertyOptional()
  time_start?: string;

  @IsString()
  @ApiPropertyOptional()
  course_type?: string;
}
