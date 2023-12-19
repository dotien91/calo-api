import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateUserMoodDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  text: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  image: string;
}
