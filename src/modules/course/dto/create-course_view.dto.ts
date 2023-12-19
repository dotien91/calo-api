import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";

export class CreateCourseViewDto {
  @IsString()
  @ApiProperty()
  module_id: string;
}
