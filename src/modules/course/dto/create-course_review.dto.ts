import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

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

  @IsNumber()
  @ApiProperty()
  rating: number;
}
