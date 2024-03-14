import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListCourseModuleDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  parent_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  course_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  auth_id?: string;

  @IsIn(["0", "1"])
  @IsOptional(null)
  @ApiPropertyOptional()
  is_parent?: string;

  @IsIn(["0", "1"])
  @IsOptional(null)
  @ApiPropertyOptional()
  is_child?: string;
}
