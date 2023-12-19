import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsJSON } from "class-validator";
export class CreateQuestionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsJSON()
  question: string;

  @IsString()
  question_key: string;

  @IsString()
  question_language: string;

  @IsString()
  @IsOptional(null)
  image: string;

  @IsString()
  @IsOptional(null)
  ref_id: string;

  @IsString()
  @IsOptional(null)
  status: string;

  @IsJSON()
  @IsOptional(null)
  public_album: string;

  @IsNumberString()
  @IsOptional(null)
  is_official: number;

  @IsNumberString()
  @IsOptional(null)
  is_validate: number;

  @IsJSON()
  @IsOptional(null)
  parent_id: string;
}
