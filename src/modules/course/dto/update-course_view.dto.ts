import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";
import { CreateCourseDto } from "./create-course.dto";
import { CreateCourseViewDto } from "./create-course_view.dto";

export class UpdateCourseViewDto extends PartialType(CreateCourseViewDto) {
  @IsString()
  @ApiProperty()
  _id?: string

  user_id?: string

}
