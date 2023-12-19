import { IsString, IsOptional, IsUrl } from "class-validator";
import { CreateLawyerTypeDto } from "./create.lawyer_type.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateLawyerTypeDto extends CreateLawyerTypeDto {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  name: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description: string;

  @IsUrl()
  @IsOptional(null)
  @ApiPropertyOptional()
  icon: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  parent_id: string;
}
