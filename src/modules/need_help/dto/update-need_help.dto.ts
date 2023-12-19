import { PartialType } from "@nestjs/swagger";
import { CreateNeedHelpDto } from "./create-need_help.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateNeedHelpDto extends PartialType(CreateNeedHelpDto) {
  @IsString()
  @IsOptional(null)
  _id?: string;
}
