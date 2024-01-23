import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class UpdateCourseCalendarDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsNumber()
  @ApiPropertyOptional()
  day?: number;

  @IsString()
  @ApiPropertyOptional()
  timeDuration?: string;

  @IsString()
  @ApiPropertyOptional()
  timeStart?: string;
}
