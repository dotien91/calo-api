import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class UpdateCourseReviewDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @ApiPropertyOptional()
  review: string;

  @IsNumber()
  @ApiPropertyOptional()
  rating: number;
}
