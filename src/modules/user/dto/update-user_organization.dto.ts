import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateUserOrganizationDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsString()
  @ApiPropertyOptional()
  logo?: string;

  @IsString()
  @ApiPropertyOptional()
  cover?: string;

  @IsString()
  @ApiPropertyOptional()
  address?: string;

  @IsString()
  @ApiPropertyOptional()
  phone_number?: string;

  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @ApiPropertyOptional()
  long_description?: string;
}
