import { IsOptional, IsDateString, IsString, IsEmail } from "class-validator";
export class CreateNeedHelpDto {
  @IsString()
  help_title: string;

  @IsString()
  help_description: string;

  @IsString()
  @IsOptional(null)
  language: string;
}
