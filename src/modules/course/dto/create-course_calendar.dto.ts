import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateCourseCalendarDto {
  @IsString()
  @ApiProperty()
  timeDuration: string;

  @IsNumber()
  @ApiProperty()
  day: number;

  @IsString()
  @ApiProperty()
  timeStart: string;

  @IsString()
  @ApiPropertyOptional()
  timeEnd?: string;

  @IsString()
  @ApiProperty()
  courseType: string;
}
