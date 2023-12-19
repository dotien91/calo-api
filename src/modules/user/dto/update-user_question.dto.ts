import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsJSON, IsOptional, IsString } from "class-validator";

export class UpdateUserQuestionDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string;

  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  note: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  question: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  image: string;
}
