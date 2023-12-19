import { PartialType } from "@nestjs/mapped-types";
import { IsString, IsOptional, IsIn, IsNumberString } from "class-validator";
import { CreateCourseDto } from "./create-course.dto";
import { ApiOperation, ApiProperty } from "@nestjs/swagger";

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsString()
  @ApiProperty()
  _id: string;
}
