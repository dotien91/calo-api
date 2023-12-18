import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class CreateLawyerTypeDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsUrl()
  @ApiProperty()
  icon: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  parent_id: string;
}
