import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsJSON, IsNumberString } from "class-validator";

export class UpdateUserInterestDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  name: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  name_object: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  image: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  color: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  parent_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  interest_key: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  priority: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  cover: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  description_object: string;
}
