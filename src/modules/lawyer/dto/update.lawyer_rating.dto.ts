import { IsString, IsOptional, IsUrl, IsIn, IsDateString } from "class-validator";
import { CreateLawyerRatingDto } from "./create.lawyer_rating.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateLawyerRatingDto extends CreateLawyerRatingDto {
  @IsString()
  @ApiProperty()
  lawyer_id: string;

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  @IsOptional(null)
  created_by: string;

  @IsDateString()
  @ApiProperty()
  @IsOptional(null)
  created_time: string;

  @IsString()
  @ApiProperty()
  response: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description: string;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  @ApiPropertyOptional()
  number_value: string;

  createBy: string
}
