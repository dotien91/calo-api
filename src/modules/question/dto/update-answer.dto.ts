import { IsString, IsOptional, IsIn } from "class-validator";
import { CreateAnswerDto } from "./create-answer.dto";

export class UpdateAnswerDto extends CreateAnswerDto {
  @IsString()
  _id: string;

  @IsString()
  @IsOptional(null)
  answer: string;
}
