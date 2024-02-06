import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDefined, IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListCourseOneOneDto {
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
  @IsOptional(null)
  @ApiPropertyOptional()
  course_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id?: string;
}

export class GetOneOneTimeAvailableDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  course_id?: string;

  @IsString()
  @IsDefined()
  @ApiProperty()
  user_id: string;
}

