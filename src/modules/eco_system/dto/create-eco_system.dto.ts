import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsJSON } from "class-validator";
export class CreateEcoSystemDto {
  @IsString()
  id?: string;

  @IsString()
  name?: string;

  @IsString()
  @IsOptional(null)
  color?: string;

  @IsJSON()
  @IsOptional(null)
  des?: any;

  @IsJSON()
  @IsOptional(null)
  feature?: string;

  @IsString()
  @IsOptional(null)
  logo?: string;

  @IsJSON()
  @IsOptional(null)
  link?: any;

  @IsString()
  @IsOptional(null)
  video?: string;

  @IsJSON()
  @IsOptional(null)
  white_list?: string;

  @IsJSON()
  @IsOptional(null)
  public_album?: string;

  @IsString()
  @IsOptional(null)
  deeplink?: string;
}
