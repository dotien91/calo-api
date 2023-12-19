import { PartialType } from "@nestjs/mapped-types";
import { IsString } from "class-validator";
import { CreateQuestionDto } from "./create-question.dto";

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @IsString()
  _id: string;
}
