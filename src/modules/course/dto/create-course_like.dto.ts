import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateCourseLikeDto {
  @IsString()
  @ApiProperty()
  course_id: string

  @IsString()
  @ApiProperty()
  @IsOptional(null)
  user_id: string

  @IsString()
  @ApiProperty()
  @IsOptional(null)
  add_type: string
}
