import { PartialType } from "@nestjs/mapped-types";
import { IsString } from "class-validator";
import { CreatePromptHistoryDto } from "./create-prompt_history.dto";

export class UpdatePromptHistoryDto extends PartialType(CreatePromptHistoryDto) {
  @IsString()
  _id: string;
}
