import { IsOptional, IsString } from "class-validator";

export class CreateContactUsDto {
  @IsString()
  report_type: string;

  @IsString()
  partner_id: string;

  @IsString()
  @IsOptional(null)
  report_content: string;

  @IsString()
  @IsOptional(null)
  report_image: string;

  @IsString()
  @IsOptional(null)
  report_email: string;

  @IsString()
  @IsOptional(null)
  report_status: string;

  @IsString()
  @IsOptional(null)
  report_name: string;

  @IsString()
  g_recaptcha_response: string;
}
