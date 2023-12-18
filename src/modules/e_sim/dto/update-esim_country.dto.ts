import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn, IsJSON, IsNumberString } from "class-validator";
import { CreateEsimCountryDto } from "./create-esim_country.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateEsimCountryDto extends PartialType(CreateEsimCountryDto) {
  @IsString()
  @IsOptional(null)
  @ApiProperty()
  _id?: String
}
