import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDefined, IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListCourseClassDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by: "DESC" | "ASC";

  @IsString()
  @IsDefined()
  @ApiProperty()
  course_id: string;
}

