import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsJSON, IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateUserInterestDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  name_object: string;

  @IsString()
  @ApiProperty()
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
  @ApiProperty()
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

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  parent_id: string;
}
