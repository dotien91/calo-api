import { IsNumberString, IsOptional, IsString } from "class-validator";
export class CreateShortDto {
  @IsString()
  media_id: string;

  @IsString()
  caption: string;

  @IsString()
  @IsOptional(null)
  hashtag_id: string;

  @IsNumberString()
  @IsOptional(null)
  short_status: number;

  @IsString()
  @IsOptional(null)
  ref_id: string;

  @IsString()
  @IsOptional(null)
  short_category: string;
}
