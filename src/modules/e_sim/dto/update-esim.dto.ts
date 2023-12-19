import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn, IsJSON, IsNumberString } from "class-validator";
import { CreateEsimDto } from "./create-esim.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateEsimDto extends PartialType(CreateEsimDto) {
  @IsString()
  @IsOptional(null)
  @ApiProperty()
  _id?: string;

  plan_id?: string;
}
