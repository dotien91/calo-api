import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { CreateCourseViewDto } from "./create-course_view.dto";

export class UpdateCourseViewDto extends PartialType(CreateCourseViewDto) {
  @IsString()
  @ApiProperty()
  _id?: string;

  user_id?: string;
}
