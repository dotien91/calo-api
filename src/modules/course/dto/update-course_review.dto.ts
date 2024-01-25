import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsString, Max, Min } from "class-validator";

export class UpdateCourseReviewDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @ApiPropertyOptional()
  review?: string;

  @IsInt()
  @ApiPropertyOptional()
  @Min(0)
  @Max(5)
  rating?: number;
}
