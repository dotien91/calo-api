import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreateEsimCountryDto {
  @IsString()
  @ApiProperty()
  name?: string;

  @IsString()
  @ApiProperty()
  avatar?: string;

  @IsJSON()
  @ApiProperty()
  translate?: any;

  @IsString()
  @ApiProperty()
  country_code: string;
}
