import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Max, Min } from "class-validator";

export class CreateCourseReviewDto {
  @IsString()
  @ApiProperty()
  course_id: string;

  @IsString()
  @ApiProperty()
  user_id: string;

  @IsString()
  @ApiProperty()
  review: string;

  @IsInt()
  @ApiProperty()
  @Min(0)
  @Max(5)
  rating: number;
}
