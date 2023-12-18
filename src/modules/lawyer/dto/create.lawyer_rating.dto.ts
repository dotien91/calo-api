import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString, IsUrl, IsJSON, IsDateString } from "class-validator";

export class CreateLawyerRatingDto {
  @IsString()
  @ApiProperty()
  lawyer_id: string;

  @IsString()
  @ApiProperty()
  @IsOptional(null)
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
  description: string;

  @IsString()
  @ApiProperty()
  response: string;

  @IsIn(["1", "2", "3", "4", "5"])
  @ApiProperty()
  number_value: string;

  @IsIn(["1", "2", "3", "4", "5"])
  @ApiPropertyOptional()
  @IsOptional(null)
  number_accuracy: number;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  @ApiPropertyOptional()
  number_communication: number;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  @ApiPropertyOptional()
  number_location: number;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  @ApiPropertyOptional()
  number_check_in: number;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  @ApiPropertyOptional()
  number_for_value: number;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  rating_media?: string | string[]
}
