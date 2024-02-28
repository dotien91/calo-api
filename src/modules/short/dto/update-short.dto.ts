import { IsNumberString, IsOptional, IsString } from "class-validator";

export class UpdateShortDto {
  @IsString()
  _id: string;

  @IsString()
  @IsOptional(null)
  caption: string;

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
