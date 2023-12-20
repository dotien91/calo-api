import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { CreateCourseDto } from "./create-course.dto";
import { CreateCourseModuleDto } from "./create-course_module.dto";

export class UpdateCourseModuleDto extends PartialType(CreateCourseModuleDto) {
  @IsString()
  @ApiProperty()
  _id: string;
}
