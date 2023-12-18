import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreateEsimDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  avatar: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  description: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  data_number: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  validity_number: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  country: string;

  @IsJSON()
  @IsOptional(null)
  @ApiProperty()
  supported_countries: any;

  @IsJSON()
  @ApiProperty()
  options: any;

  @IsJSON()
  @IsOptional(null)
  @ApiProperty()
  network: any;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  plan_type: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  activation_policy: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  eKYC: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  top_up_option: string;

  @IsJSON()
  @IsOptional(null)
  @ApiProperty()
  available_top_up: any;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  language: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  color: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiProperty()
  buy_number: string

  @IsNumberString()
  @ApiProperty()
  amount_of_day: string

  @IsString()
  @ApiProperty()
  service_id: string

  @IsNumberString()
  @ApiProperty()
  price: string

  @IsString()
  @ApiProperty()
  version: string
}
