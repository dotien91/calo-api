import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateCourseModuleDto {
  @IsString()
  @ApiProperty()
  course_id: string;

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  type: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  parent_id?: string;
}
